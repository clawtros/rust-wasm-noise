// mod utils;
use wasm_bindgen::prelude::*;
use noise::{NoiseFn, OpenSimplex};

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct NoiseGrid {
    width: u32,
    height: u32,
    z: f64,
    scale: f64,
    speed: f64,
    cells: Vec<f64>
}

#[wasm_bindgen]
impl NoiseGrid {
    pub fn new(width: u32, height: u32, speed: f64, scale: f64) -> NoiseGrid {
        let noise = OpenSimplex::new();
        let z = 0.0;
        let cells = (0..width * height)
            .map(|i| {
                let x = i % width;
                let y = i / height;
                return noise.get([f64::from(x) * scale, f64::from(y) * scale, z]);
            }).collect();
        
        return NoiseGrid {
            width,
            height,
            z,
            speed,
            scale,
            cells            
        }
    }

    pub fn cells(&self) -> *const f64 {
        return self.cells.as_ptr();
    }
   
    pub fn tick(&mut self) {
        let noise = OpenSimplex::new();
        let _z = self.z + self.speed;
        let cells = (0..self.width * self.height)
            .map(|i| {
                let x = i % self.width;
                let y = i / self.height;
                return noise.get([f64::from(x) * self.scale, f64::from(y) * self.scale, _z]);
            }).collect();
        self.z = _z;
        self.cells = cells;
    }
}
