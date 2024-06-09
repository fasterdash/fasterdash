use wasm_bindgen::prelude::*;
use std::cmp::Ordering;
use serde_json::{self, Value};
use serde_wasm_bindgen::{from_value, to_value};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::hash::{Hash, Hasher};
use js_sys::Function;
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

// Custom implementation to hash serde_json::Value as a string
#[derive(Serialize, Deserialize, PartialEq, Eq, Clone)]
struct HashableValue(Value);

impl Hash for HashableValue {
    fn hash<H: Hasher>(&self, state: &mut H) {
        let s = serde_json::to_string(&self.0).unwrap();
        s.hash(state);
    }
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
    // index: usize,
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
                // index: criteria_index as usize,
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
    arr.into_iter().filter(|&x| x != 0).collect()
    // TODO!: Should it do this instead?
    // items.into_iter().filter_map(|item| item).collect()
}

#[wasm_bindgen]
pub fn clone_deep(data: &JsValue) -> JsValue {
    let data: Value = from_value(data.clone()).unwrap();
    let cloned_data = data.clone();
    to_value(&cloned_data).unwrap()
}

#[wasm_bindgen]
pub fn merge(map1: JsValue, map2: JsValue) -> JsValue {
    let map1: HashMap<String, Value> = from_value(map1).unwrap();
    let map2: HashMap<String, Value> = from_value(map2).unwrap();
    let mut result = map1.clone();
    for (key, value) in map2 {
        result.insert(key, value);
    }
    to_value(&result).unwrap()
}

#[wasm_bindgen]
pub fn group_by(items: JsValue, key: &str) -> JsValue {
    // Deserialize JsValue to Vec<Value>
    let items: Vec<Value> = from_value(items).unwrap_or_else(|_| Vec::new());
    let mut map: HashMap<String, Vec<Value>> = HashMap::new();

    for item in items.into_iter() {
        if let Some(key_value) = item.get(key).and_then(|v| v.as_str()) {
            map.entry(key_value.to_string()).or_insert_with(Vec::new).push(item);
        }
    }

    // Serialize the result back to JsValue
    to_value(&map).unwrap_or_else(|_| JsValue::NULL)
}

#[wasm_bindgen]
pub fn flatten_deep(vec: JsValue) -> JsValue {
    let vec: Vec<Value> = from_value(vec).unwrap();
    let flattened = flatten_deep_iterative(vec);
    to_value(&flattened).unwrap()
}

fn flatten_deep_iterative(vec: Vec<Value>) -> Vec<Value> {
    let mut result = Vec::new();
    let mut stack = vec![vec];

    while let Some(current) = stack.pop() {
        for item in current {
            if item.is_array() {
                stack.push(item.as_array().unwrap().clone());
            } else {
                result.push(item);
            }
        }
    }

    result
}

#[wasm_bindgen]
pub fn uniq(array: JsValue) -> JsValue {
    let array: Vec<Value> = from_value(array).unwrap();
    let mut seen = HashSet::new();
    let mut unique_array = Vec::new();

    for item in array {
        if seen.insert(serde_json::to_string(&item).unwrap()) {
            unique_array.push(item);
        }
    }
    to_value(&unique_array).unwrap()
}

#[wasm_bindgen]
pub fn chunk(array: JsValue, size: usize) -> JsValue {
    let array: Vec<Value> = from_value(array).unwrap();
    let mut chunks = Vec::new();
    for chunk in array.chunks(size) {
        chunks.push(chunk.to_vec());
    }
    to_value(&chunks).unwrap()
}

#[wasm_bindgen]
pub fn difference(array: JsValue, values: JsValue) -> JsValue {
    let array: Vec<Value> = from_value(array).unwrap();
    let values: HashSet<HashableValue> = from_value(values).unwrap();
    let diff: Vec<Value> = array.into_iter()
        .filter(|v| !values.contains(&HashableValue(v.clone())))
        .collect();
    to_value(&diff).unwrap()
}

#[wasm_bindgen]
pub fn flatten(array: JsValue) -> JsValue {
    let array: Vec<Value> = from_value(array).unwrap();
    let mut result = Vec::new();
    for item in array {
        if let Some(sub_array) = item.as_array() {
            for sub_item in sub_array {
                result.push(sub_item.clone());
            }
        } else {
            result.push(item);
        }
    }
    to_value(&result).unwrap()
}

#[wasm_bindgen]
pub fn sum(array: JsValue) -> JsValue {
    let array: Vec<Value> = from_value(array).unwrap();
    let sum: f64 = array.iter().filter_map(|v| v.as_f64()).sum();
    to_value(&sum).unwrap()
}

#[wasm_bindgen]
pub fn range(start: i32, end: i32, step: i32) -> JsValue {
    let step = if step == 0 { 1 } else { step };
    let range: Vec<Value> = (start..end).step_by(step as usize).map(Value::from).collect();
    to_value(&range).unwrap()
}

#[wasm_bindgen]
pub fn fill(array: JsValue, value: JsValue, start: usize, end: usize) -> JsValue {
    let mut array: Vec<Value> = from_value(array).unwrap();
    let value: Value = from_value(value).unwrap();
    let end = end.min(array.len());
    for i in start..end {
        array[i] = value.clone();
    }
    to_value(&array).unwrap()
}

#[wasm_bindgen]
pub fn reverse(array: JsValue) -> JsValue {
    let mut array: Vec<Value> = from_value(array).unwrap();
    array.reverse();
    to_value(&array).unwrap()
}

#[wasm_bindgen]
pub fn filter(array: JsValue, predicate: &Function) -> JsValue {
    let array: Vec<Value> = from_value(array).unwrap();
    let filtered: Vec<Value> = array.into_iter()
        .filter(|item| predicate.call1(&JsValue::NULL, &to_value(item).unwrap()).unwrap().as_bool().unwrap())
        .collect();
    to_value(&filtered).unwrap()
}

#[wasm_bindgen]
pub fn reduce(array: JsValue, callback: &Function, initial: JsValue) -> JsValue {
    let array: Vec<Value> = from_value(array).unwrap();
    let mut accumulator = initial;

    for item in array {
        accumulator = callback.call2(&JsValue::NULL, &accumulator, &to_value(&item).unwrap()).unwrap();
    }

    accumulator
}
