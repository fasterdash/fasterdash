use wasm_bindgen::prelude::*;
use console_error_panic_hook;
use wasm_logger;
use std::slice;

const MIN_MERGE: usize = 32;

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
}

fn min_run_length(mut n: usize) -> usize {
    let mut r = 0;
    while n >= MIN_MERGE {
        r |= n & 1;
        n >>= 1;
    }
    n + r
}

fn insertion_sort<T: Ord + Send + Clone>(arr: &mut [T], left: usize, right: usize) {
    for i in (left + 1)..=right {
        let key = arr[i].clone();
        let mut j = i;
        while j > left && arr[j - 1] > key {
            arr[j] = arr[j - 1].clone();
            j -= 1;
        }
        arr[j] = key;
    }
}

fn timsortmerge<T: Ord + Send + Clone>(arr: &mut [T], l: usize, m: usize, r: usize) {
    let left = arr[l..=m].to_vec();
    let right = arr[(m + 1)..=r].to_vec();
    let mut i = 0;
    let mut j = 0;
    let mut k = l;
    while i < left.len() && j < right.len() {
        if left[i] <= right[j] {
            arr[k] = left[i].clone();
            i += 1;
        } else {
            arr[k] = right[j].clone();
            j += 1;
        }
        k += 1;
    }
    while i < left.len() {
        arr[k] = left[i].clone();
        i += 1;
        k += 1;
    }
    while j < right.len() {
        arr[k] = right[j].clone();
        j += 1;
        k += 1;
    }
}

#[wasm_bindgen]
pub fn sort(arr: &mut [i32]) {
    let n = arr.len();
    let min_run = min_run_length(n);

    // Sort individual subarrays of size min_run
    for start in (0..n).step_by(min_run) {
        let end = (start + min_run - 1).min(n - 1);
        insertion_sort(arr, start, end);
    }

    let mut size = min_run;
    while size < n {
        let arr_ptr = arr.as_mut_ptr();
        for left in (0..n).step_by(size * 2) {
            let mid = left + size - 1;
            if mid >= n - 1 {
                continue;
            }
            let right = (left + 2 * size - 1).min(n - 1);
            unsafe {
                timsortmerge(slice::from_raw_parts_mut(arr_ptr.add(left), right - left + 1), 0, mid - left, right - left);
            }
        }
        size *= 2;
    }
}
