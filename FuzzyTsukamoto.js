const readline = require('readline');

// Fungsi keanggotaan untuk suhu
const membershipSuhu = (type, data_suhu) => {
    switch (type) {
        case 'rendah':
            if (data_suhu <= 18 || data_suhu >= 26) return 0;
            if (data_suhu >= 18 && data_suhu <= 22) return (data_suhu - 18) / 4;
            if (data_suhu > 22 && data_suhu <= 26) return (26 - data_suhu) / 4;
            break;
        case 'normal':
            if (data_suhu <= 22 || data_suhu >= 32) return 0;
            if (data_suhu > 22 && data_suhu <= 26) return (data_suhu - 22) / 4;
            if (data_suhu > 26 && data_suhu <= 32) return (32 - data_suhu) / 6;
            break;
        case 'tinggi':
            if (data_suhu <= 26 || data_suhu >= 38) return 0;
            if (data_suhu > 26 && data_suhu <= 32) return (data_suhu - 26) / 6;
            if (data_suhu > 32 && data_suhu <= 38) return (38 - data_suhu) / 6;
            break;
        default:
            throw new Error('Invalid type');
    }
};

// Fungsi keanggotaan untuk bising
const membershipBising = (type, data_kebisingan) => {
    switch (type) {
        case 'tenang':
            if (data_kebisingan <= 35 || data_kebisingan >= 75) return 0;
            if (data_kebisingan > 35 && data_kebisingan <= 55) return (data_kebisingan - 35) / 20;
            if (data_kebisingan > 55 && data_kebisingan <= 75) return (75 - data_kebisingan) / 20;
            break;
        case 'agak bising':
            if (data_kebisingan <= 55 || data_kebisingan >= 90) return 0;
            if (data_kebisingan > 55 && data_kebisingan <= 75) return (data_kebisingan - 55) / 20;
            if (data_kebisingan > 75 && data_kebisingan <= 90) return (90 - data_kebisingan) / 15;
            break;
        case 'bising':
            if (data_kebisingan <= 75 || data_kebisingan >= 105) return 0;
            if (data_kebisingan > 75 && data_kebisingan <= 90) return (data_kebisingan - 75) / 15;
            if (data_kebisingan > 90 && data_kebisingan <= 105) return (105 - data_kebisingan) / 15;
            break;
        default:
            throw new Error('Invalid type');
    }
};

// Fungsi keanggotaan untuk cahaya
const membershipCahaya = (type, data_pencahayaan) => {
    switch (type) {
        case 'redup':
            if (data_pencahayaan <= 0 || data_pencahayaan >= 300) return 0;
            if (data_pencahayaan > 0 && data_pencahayaan <= 150) return data_pencahayaan / 150;
            if (data_pencahayaan > 150 && data_pencahayaan <= 300) return (300 - data_pencahayaan) / 150;
            break;
        case 'agak terang':
            if (data_pencahayaan <= 150 || data_pencahayaan >= 500) return 0;
            if (data_pencahayaan > 150 && data_pencahayaan <= 300) return (data_pencahayaan - 150) / 150;
            if (data_pencahayaan > 300 && data_pencahayaan <= 500) return (500 - data_pencahayaan) / 200;
            break;
        case 'terang':
            if (data_pencahayaan <= 300 || data_pencahayaan >= 700) return 0;
            if (data_pencahayaan > 300 && data_pencahayaan <= 500) return (data_pencahayaan - 300) / 200;
            if (data_pencahayaan > 500 && data_pencahayaan <= 700) return (700 - data_pencahayaan) / 200;
            break;
        default:
            throw new Error('Invalid type');
    }
};

// Fungsi keanggotaan untuk OUTPUT (Produksi) - Tsukamoto membutuhkan ini
const membershipOutput = (z) => {
    // Fungsi keanggotaan monoton naik
    if (z <= 130) return 0;
    if (z > 130 && z <= 160) return (z - 130) / 30;
    if (z > 160) return 1;
};

// Fungsi invers keanggotaan output untuk Tsukamoto
const inverseMembershipOutput = (alpha) => {
    // Invers dari fungsi keanggotaan output
    // μ(z) = (z - 130)/30 → z = 130 + 30*α
    return 130 + 30 * alpha;
};

// Rule base untuk Tsukamoto (berisi nilai z yang memenuhi μ(z) = α)
const outputRules = [
    148.00, 150.90, 146.50, 143.10, 146.53, 142.73, 136.73, 140.77, 135.97,
    149.73, 153.27, 152.13, 148.00, 150.63, 147.63, 141.47, 145.67, 140.20,
    142.10, 146.53, 142.17, 138.70, 141.40, 138.30, 133.33, 138.53, 133.77
];

const fuzzyInput = (suhu, cahaya, bising) => ({
    suhu: [
        membershipSuhu('rendah', suhu),
        membershipSuhu('normal', suhu),
        membershipSuhu('tinggi', suhu)
    ],
    cahaya: [
        membershipCahaya('redup', cahaya),
        membershipCahaya('agak terang', cahaya),
        membershipCahaya('terang', cahaya)
    ],
    bising: [
        membershipBising('tenang', bising),
        membershipBising('agak bising', bising),
        membershipBising('bising', bising)
    ]
});

const hitungTsukamoto = (suhu, cahaya, bising) => {
    const fuzzy = fuzzyInput(suhu, cahaya, bising);
    let numerator = 0;
    let denominator = 0;
    let index = 0;

    for (let i = 0; i < 3; i++) { // suhu
        for (let j = 0; j < 3; j++) { // bising
            for (let k = 0; k < 3; k++) { // cahaya
                const w = Math.min(fuzzy.suhu[i], fuzzy.bising[j], fuzzy.cahaya[k]);
                
                // Hitung z dengan invers fungsi keanggotaan output
                const z = inverseMembershipOutput(w);

                // Debug nilai z dan μ(z) untuk setiap rule
                // console.log(`Rule ${index}: z=${z.toFixed(2)}, μ(z)=${membershipOutput(z).toFixed(2)}`);
                
                // Untuk Tsukamoto, kita bisa juga menggunakan nilai z dari rule base
                // yang sudah memenuhi μ(z) = α, tapi dalam contoh ini kita hitung langsung
                // const z = outputRules[index]; // Alternatif jika rule base sudah sesuai
                
                numerator += w * z;
                denominator += w;
                index++;
            }
        }
    }

    return denominator === 0 ? 0 : numerator / denominator;
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Masukkan suhu: ', (suhuInput) => {
    rl.question('Masukkan cahaya: ', (cahayaInput) => {
        rl.question('Masukkan kebisingan: ', (bisingInput) => {
            const suhu = parseFloat(suhuInput); // ex: 28
            const cahaya = parseFloat(cahayaInput); // ex: 350
            const bising = parseFloat(bisingInput); // ex: 60

            const hasil = hitungTsukamoto(suhu, cahaya, bising);

            // console.log(`Suhu: ${suhu}`);
            // console.log(`Cahaya: ${cahaya}`);
            // console.log(`Kebisingan: ${bising}`);
            console.log(`Hasil Produksi Fuzzy Tsukamoto: ${hasil.toFixed(2)}`);

            rl.close();
        });
    });
});
