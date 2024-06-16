use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicU64};
use std::thread;
use solana_sdk::signature::Keypair;
use solana_sdk::signer::Signer;

fn main() {
    const PREFIX: &str = "shuri";
    let start = std::time::Instant::now();
    let mut handles: Vec<_> = Vec::new();
    let done = Arc::new(AtomicBool::new(false));
    let attempts = Arc::new(AtomicU64::new(1));
    for _ in 0..=12 {
        let done = done.clone();
        let attempts = attempts.clone();
        handles.push(thread::spawn(move || {
            loop {
                if done.load(std::sync::atomic::Ordering::Relaxed) {
                    break;
                }
                let attempts = attempts.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                if attempts % 1_000_000 == 0 {
                    println!("Attempts: {}, time: {}s", attempts, start.elapsed().as_secs());
                }
                let keypair = Keypair::new();
                if keypair.pubkey().to_string().to_lowercase().starts_with(PREFIX) {
                    println!("pubkey: {:?}; private key: {:?}", keypair.pubkey(), keypair.secret());
                    println!("Elapsed time: {:?}; attempts: {}", start.elapsed(), attempts);
                    done.store(true, std::sync::atomic::Ordering::Relaxed);
                    break;
                }
            }
        }));
    }
    for thread_handle in handles {
        thread_handle.join().unwrap();
    }
}
