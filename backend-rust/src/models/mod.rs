pub mod auv;
pub mod day_data;
pub mod hockey;
pub mod settings;
pub mod tags;
pub mod weekly;

// converts the f32 into a i32 for storage in the db
pub fn ftoi(n: f32) -> i32 {
    (n * 100.) as i32
}

// converts an i32 from the db back into a f32
pub fn itof(n: i32) -> f32 {
    n as f32 / 100.
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ftoi_test() {
        let orig = 1024.76;
        let i = ftoi(orig);
        let f = itof(i);

        assert_eq!(f, orig, "[orig: {orig}] [i: {i}] [f: {f}]");
    }
}
