use drive_v3::objects::File;
use drive_v3::Error;
use drive_v3::{Credentials, Drive};
use log::{debug, error};

use crate::ENVIRONMENT;

pub fn get_credentials() -> Result<Credentials, Error> {
    let scopes: [&'static str; 2] = [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
    ];

    let cred_path = ENVIRONMENT.with_data_path("creds.json");
    let creds = match std::fs::exists(&cred_path) {
        Ok(exist) => {
            if exist {
                let mut c = Credentials::from_file(&cred_path, &scopes)?;
                if !c.are_valid() {
                    c.refresh()?;
                }

                // save again
                c.store(&cred_path)?;
                c
            } else {
                let secrets = ENVIRONMENT.with_data_path("secret.json");
                let c = Credentials::from_client_secrets_file(secrets, &scopes)?;
                // save them
                c.store(&cred_path)?;
                c
            }
        }
        Err(err) => {
            error!("Unable to check for stored Credentials.");
            return Err(drive_v3::Error::new(
                drive_v3::ErrorKind::IO,
                format!("Failure to check path for creds.json.  Error: {err}"),
            ));
        }
    };

    Ok(creds)
}

// get all recent spreadsheets and return the filename
pub fn get_recent_sheets(creds: &Credentials, max: usize) -> Result<Vec<File>, Error> {
    let drive = Drive::new(creds);
    let files = drive
        .files
        .list()
        .fields("files(name,id,parents,mimeType)")
        .q("mimeType contains 'spreadsheet' and trashed=false")
        .order_by("recency")
        .execute()?;

    let mut files = match files.files {
        None => return Ok(Vec::new()), // no files returned
        Some(f) => f,
    };

    files.truncate(max);
    Ok(files)
}

// retrieves both control and wisr file listing from google drive
pub fn get_control_wisr(
    creds: &Credentials,
    max: usize,
) -> drive_v3::Result<(Vec<File>, Vec<File>)> {
    debug!("Retrieving control and wisr's from google drive...");

    let drive = Drive::new(creds);
    let files = drive
        .files
        .list()
        .fields("files(name,id)")
        .q("mimeType contains 'pdf' and trashed=false")
        .order_by("recency")
        .execute()?;

    // sort list of file names into each array depending on what matches
    let mut control = Vec::new();
    let mut wisr = Vec::new();

    for file in &files.files.unwrap() {
        let fname = file.name.clone().unwrap();
        if fname.starts_with("ControlSheetReport_") {
            control.push(file.clone());
        }

        if fname.starts_with("WISRReport_") {
            wisr.push(file.clone());
        }
    }

    debug!("Retrieve success.");
    control.truncate(max);
    wisr.truncate(max);

    Ok((control, wisr))
}

// fetch a file from google drive and store in a temp location
// Returns path to temp file
// On error, returns an error message
pub fn fetch_file_for_import(file_id: &str) -> Result<String, drive_v3::Error> {
    // 1) retrieve file from drive
    // 2) generate temp file
    // 3) save and return file name

    debug!("Fetching file from google drive with id: {file_id}");
    let creds = get_credentials()?;
    let drive = Drive::new(&creds);

    // generate output name
    let path = ENVIRONMENT.with_temp_path(file_id);
    debug!("  Saving to {path:?}");

    drive.files.get_media(file_id).save_to(&path).execute()?;

    Ok(path.to_str().unwrap().to_owned())
}
