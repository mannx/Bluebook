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
}
