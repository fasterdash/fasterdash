use wasm_bindgen::prelude::*;
use std::cmp::Ordering;
use serde_json::{self, Value};
use serde_wasm_bindgen::{from_value, to_value};
use serde::{Deserialize, Serialize};
use console_error_panic_hook;
use wasm_logger;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[derive(Serialize, Deserialize, Debug)]
enum Iteratee {
    Path(Vec<String>),
    Property(String),
}

impl Iteratee {
    fn to_fn(&self) -> Box<dyn Fn(&Value) -> Value> {
        match self {
            Iteratee::Path(path) => {
                let path_clone = path.clone();
                Box::new(move |value| base_get(value, &path_clone.iter().map(String::as_str).collect::<Vec<&str>>()))
            }
            Iteratee::Property(property) => {
                let property_clone = property.clone();
                Box::new(move |value| value[&property_clone].clone())
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
        (Value::Number(a), Value::Number(b)) => {
            let a = a.as_f64().unwrap_or(0.0);
            let b = b.as_f64().unwrap_or(0.0);
            a.partial_cmp(&b).unwrap_or(Ordering::Equal)
        }
        (Value::String(a), Value::String(b)) => {
            a.cmp(b)
        }
        (Value::Bool(a), Value::Bool(b)) => {
            a.cmp(b)
        }
        _ => {
            Ordering::Equal
        }
    }
}

// Types and struct definitions
type IterateeFn = Box<dyn Fn(&Value) -> Value>;

#[derive(Clone, Debug)]
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
pub fn initialize() {
    console_error_panic_hook::set_once();
    wasm_logger::init(wasm_logger::Config::default());
}

#[wasm_bindgen]
pub fn order_by(
    collection: &JsValue,
    iteratees: &JsValue,
    orders: &JsValue,
) -> JsValue {
    let collection: Value = from_value(collection.clone()).unwrap_or_else(|_| Value::Null);
    let iteratees: Vec<String> = from_value(iteratees.clone()).unwrap_or_else(|_| vec![]);
    let orders: Vec<String> = from_value(orders.clone()).unwrap_or_else(|_| vec!["asc".to_string(); iteratees.len()]).into_iter().map(String::from).collect();

    // info!("Collection: {:?}", collection);
    // info!("Raw Iteratees: {:?}", iteratees);
    // info!("Orders: {:?}", orders);

    // Convert iteratees from strings to Iteratee enums
    let iteratees: Vec<Iteratee> = iteratees.into_iter().map(|s| Iteratee::Property(s)).collect();

    let mut iteratee_fns: Vec<IterateeFn> = iteratees.iter().map(|iter| {
        let func = iter.to_fn();

        // info!("Created iteratee function for: {:?}", iter);
        func
    }).collect();

    if iteratee_fns.is_empty() {
        iteratee_fns.push(Box::new(identity));
    }

    let mut criteria_index: isize = -1;
    let mut each_index = -1;

    let mut result = if is_array_like(&collection) {
        Vec::with_capacity(collection.as_array().unwrap().len())
    } else {
        Vec::new()
    };

    if let Some(array) = collection.as_array() {
        base_each(array, |value| {
            let criteria: Vec<Value> = iteratee_fns.iter().map(|iteratee| iteratee(value)).collect();

            criteria_index += 1;
            each_index += 1;

            // info!("Criteria for value {:?}: {:?}", value, criteria);

            result.push(CriteriaObject {
                criteria,
                index: criteria_index as usize,
                value: value.clone(),
            });
        });
    }

    // info!("Result before sorting: {:?}", result);

    let sorted_result = base_sort_by(result, |a, b| compare_multiple(a, b, &orders.iter().map(String::as_str).collect::<Vec<_>>()));

    // info!("Result after sorting: {:?}", sorted_result);

    to_value(&sorted_result.into_iter().map(|object| object.value).collect::<Vec<_>>()).unwrap()
}

#[wasm_bindgen]
pub fn compact(arr: Vec<i32>) -> Vec<i32> {
    arr.into_iter().collect()
}
