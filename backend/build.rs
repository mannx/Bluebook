use copy_to_output::copy_to_output;
use std::env;
use vergen_git2::*;

fn main() {
    let build = BuildBuilder::all_build().unwrap();
    let git = Git2Builder::default()
        .branch(true)
        .commit_count(true)
        .sha(true)
        .build()
        .unwrap();

    Emitter::default()
        .add_instructions(&build)
        .unwrap()
        .add_instructions(&git)
        .unwrap()
        .emit()
        .unwrap();

    // copy the .env file to the build output
    copy_to_output(".env", &env::var("PROFILE").unwrap()).expect("unable to copy");
}
