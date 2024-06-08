use wasm_bindgen::prelude::*;
use std::cmp::Ordering;
use serde_json::{self, Value};
use serde_wasm_bindgen::{from_value, to_value};
use serde::{Deserialize, Serialize};

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[derive(Serialize, Deserialize)]
enum Iteratee {
    Path(Vec<String>),
}

impl Iteratee {
    fn to_fn(&self) -> Box<dyn Fn(&Value) -> Value> {
        match self {
            Iteratee::Path(path) => {
                let path_clone = path.clone();
                Box::new(move |value| base_get(value, &path_clone.iter().map(String::as_str).collect::<Vec<&str>>()))
            }
        }
    }
}

// Placeholder functions to represent the imported functions in JS
fn base_each<F>(collection: &[Value], mut f: F)
where
    F: FnMut(&Value),
{
    for item in collection {
        f(item);
    }
}

fn base_sort_by<T, F>(mut collection: Vec<T>, compare: F) -> Vec<T>
where
    F: Fn(&T, &T) -> Ordering,
{
    collection.sort_by(compare);
    collection
}

fn base_get(value: &Value, path: &[&str]) -> Value {
    let mut current = value;
    for key in path.iter() {
        current = &current[key];
    }
    current.clone()
}

fn compare_multiple(
    object: &CriteriaObject,
    other: &CriteriaObject,
    orders: &[&str],
) -> Ordering {
    for (index, order) in orders.iter().enumerate() {
        let result = compare_values(&object.criteria[index], &other.criteria[index]);
        if result != Ordering::Equal {
            return if *order == "desc" { result.reverse() } else { result };
        }
    }
    Ordering::Equal
}

fn compare_values(a: &Value, b: &Value) -> Ordering {
    match (a, b) {
        (Value::Number(a), Value::Number(b)) => a.as_f64().partial_cmp(&b.as_f64()).unwrap_or(Ordering::Equal),
        (Value::String(a), Value::String(b)) => a.cmp(b),
        (Value::Bool(a), Value::Bool(b)) => a.cmp(b),
        _ => Ordering::Equal,
    }
}

// Types and struct definitions
type IterateeFn = Box<dyn Fn(&Value) -> Value>;

#[derive(Clone)]
struct CriteriaObject {
    criteria: Vec<Value>,
    index: usize,
    value: Value,
}

fn is_array_like(collection: &Value) -> bool {
    collection.is_array()
}

fn identity(value: &Value) -> Value {
    value.clone()
}

#[wasm_bindgen]
pub fn order_by(
    collection: &JsValue,
    iteratees: &JsValue,
    orders: &JsValue,
) -> JsValue {
    let collection: Value = from_value(collection.clone()).unwrap();
    let iteratees: Vec<Iteratee> = from_value(iteratees.clone()).unwrap();
    let orders: Vec<String> = from_value(orders.clone()).unwrap();

    let mut iteratee_fns: Vec<IterateeFn> = iteratees.into_iter().map(|iter| iter.to_fn()).collect();

    if iteratee_fns.is_empty() {
        iteratee_fns.push(Box::new(identity));
    }

    let mut criteria_index = -1;
    let mut each_index = -1;

    let mut result = if is_array_like(&collection) {
        Vec::with_capacity(collection.as_array().unwrap().len())
    } else {
        Vec::new()
    };

    base_each(collection.as_array().unwrap(), |value| {
        let criteria: Vec<Value> = iteratee_fns.iter().map(|iteratee| iteratee(value)).collect();

        criteria_index += 1;
        each_index += 1;

        result.push(CriteriaObject {
            criteria,
            index: criteria_index as usize,
            value: value.clone(),
        });
    });

    let sorted_result = base_sort_by(result, |a, b| compare_multiple(a, b, &orders.iter().map(String::as_str).collect::<Vec<_>>()));

    to_value(&sorted_result.into_iter().map(|object| object.value).collect::<Vec<_>>()).unwrap()
}

fn test_sort() -> (JsValue, JsValue) {
    let collection = serde_json::json!([
        {"name": "John", "age": 30},
        {"name": "Jane", "age": 25},
        {"name": "Doe", "age": 50}
    ]);

    let iteratees: Vec<Iteratee> = vec![
        Iteratee::Path(vec!["name".to_string()])
    ];
    let orders = vec![
        "asc".to_string()
    ];

    let collection_value = to_value(&collection).unwrap();
    let iteratees_value = to_value(&iteratees).unwrap();
    let orders_value = to_value(&orders).unwrap();

    let sorted = order_by(
        &collection_value,
        &iteratees_value,
        &orders_value
    );

    (collection_value, sorted)
}

#[wasm_bindgen]
pub fn greet() {
    let (unsorted, sorted) = test_sort();
    let unsorted_value: Value = serde_wasm_bindgen::from_value(unsorted).unwrap_or_else(|_| Value::String("Error serializing result".to_string()));
    let sorted_value: Value = serde_wasm_bindgen::from_value(sorted).unwrap_or_else(|_| Value::String("Error serializing result".to_string()));
    let unsorted_string = serde_json::to_string(&unsorted_value).unwrap_or_else(|_| "Error serializing result".to_string());
    let sorted_string = serde_json::to_string(&sorted_value).unwrap_or_else(|_| "Error serializing result".to_string());
    alert(&format!("Unsorted: {}\nSorted: {}", unsorted_string, sorted_string));
}