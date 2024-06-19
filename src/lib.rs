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

#[wasm_bindgen]
pub fn initialize() {
    console_error_panic_hook::set_once();
    wasm_logger::init(wasm_logger::Config::default());
}

#[wasm_bindgen]
pub fn compact(arr: Vec<i32>) -> Vec<i32> {
    arr.into_iter().filter(|&x| x != 0).collect()
    // TODO: Should it do this instead?
    // items.into_iter().filter_map(|item| item).collect()
}