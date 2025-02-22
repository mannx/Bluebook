#![allow(non_snake_case)]
use serde::Serialize;

#[derive(Serialize)]
pub struct ApiReturnMessage<T> {
    pub Error: bool,
    pub Message: Option<String>,
    pub Data: Option<T>,
}

impl<T> ApiReturnMessage<T> {
    pub fn error(msg: &str) -> Self {
        Self {
            Error: true,
            Message: Some(msg.to_owned()),
            Data: None,
        }
    }

    pub fn ok(data: T) -> Self {
        Self {
            Error: false,
            Message: None,
            Data: Some(data),
        }
    }

    pub fn ok_none() -> Self {
        Self {
            Error: false,
            Message: None,
            Data: None,
        }
    }
}
