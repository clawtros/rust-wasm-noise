// mod utils;
use color::{Deg, Hsv, Rgb, ToRgb};
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
    noise: SuperSimplex,
    audio_level: f64,
    image_data: [u8;65536],
}

#[wasm_bindgen]
impl NoiseGrid {
    pub fn new(width: u32, height: u32, scale: f64) -> NoiseGrid {
        let noise = SuperSimplex::new();
        let z = 0.0;
        let image_data = [0; 65536];
        let audio_level = 0.0;
        return NoiseGrid {
            width,
            height,
            z,
            scale,
            noise,
            audio_level,
            image_data,
        };
    }

    pub fn set_scale(&mut self, scale: f64) {
        self.scale = scale;
    }

    pub fn set_audio_level(&mut self, audio_level: f64) {
        self.audio_level = audio_level;
    }

    pub fn image_data(&self) -> *const u8 {
        return self.image_data.as_ptr();
    }

    pub fn tick(&mut self, speed: f64) {
        let _z = self.z + speed;
        let _imgdata = (0..65536)
            .flat_map(|i| {
                let n = self.noise.get([
                    ((i % self.width + self.width) as f64) * self.scale,
                    ((i / self.height + self.height) as f64) * self.scale,
                    _z,
                ]);
                let color: Rgb<u8> = Hsv::new(
                    Deg(n * 360.0),
                    0.7 + self.audio_level,
                    1.2 + self.audio_level,
                )
                .to_rgb();
                return vec![color.r, color.g, color.b, 255];
                //let s = ((color.r + color.g + color.b) / 3 > 32) as u8 * 255;
                // let s = (n > 0.) as u8 * 255;
                // return vec![s, s, s, 255];
            })
            .collect();
        self.z = _z;
        self.image_data = _imgdata;
    }
}
