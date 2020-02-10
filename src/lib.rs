// mod utils;
use color::Rgb;
use color::{Deg, Hsv, ToRgb};
use noise::{NoiseFn, SuperSimplex};
use wasm_bindgen::prelude::*;

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
    noise: SuperSimplex,
    image_data: Vec<u8>,
}

#[wasm_bindgen]
impl NoiseGrid {
    pub fn new(width: u32, height: u32, speed: f64, scale: f64) -> NoiseGrid {
        let noise = SuperSimplex::new();
        let z = 0.0;
        let image_data = vec![];
        return NoiseGrid {
            width,
            height,
            z,
            speed,
            scale,
            noise,
            image_data,
        };
    }

    pub fn set_scale(&mut self, scale:f64) {
        self.scale = scale;
    }

    pub fn image_data(&self) -> *const u8 {
        return self.image_data.as_ptr();
    }

    pub fn tick(&mut self) {
        let _z = self.z + self.speed;
        let _imgdata = (0..self.width * self.height)
            .flat_map(|i| {
                let n = self.noise.get([
                    ((i % self.width) as f64) * self.scale,
                    ((i / self.height) as f64) * self.scale,
                    _z,
                ]);
                let color:Rgb<u8> = Hsv::new(Deg(n * 90.0), 2.0, 15.0).to_rgb();
                let s = ((color.r + color.g + color.b) / 3 > 64) as u8 * 255;
                // let s = (n > 0.) as u8 * 255;
                return vec![s, s, s, 255];
                //return vec![color.r, color.g, color.b, 255];
            })
            .collect();
        self.z = _z;
        self.image_data = _imgdata;
    }
}
