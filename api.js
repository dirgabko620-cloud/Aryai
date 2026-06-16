const GEMINI_API_KEY = 'AQ.Ab8RN6LmKhhyrEIA-djX1bXq_cHILS5oNR5QNc_4AKxeg7nnDQ';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

async function callGemini(prompt) {
    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': GEMINI_API_KEY,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            return null;
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
        console.error('Gemini fetch error:', err);
        return null;
    }
}

const FALLBACK_RESPONSES = [
    "Tentu! Saya siap membantu. Bisa ceritakan lebih detail?",
    "Menarik! Menurut saya, hal itu bisa dilakukan dengan pendekatan bertahap.",
    "Saya pikir jawabannya tergantung konteks. Namun secara umum, kamu bisa mencoba mencari referensi lebih lanjut.",
    "Wah, pertanyaan bagus! Saya sarankan untuk membaca dan berdiskusi dengan teman atau mentor.",
    "Baik, saya coba bantu. Pertama, pahami masalahnya. Kedua, cari solusi alternatif. Ketiga, eksekusi.",
    "Resep sederhana: siapkan bahan, ikuti langkah, dan jangan lupa beri sentuhan cinta!",
    "Untuk PR sekolah, coba baca ulang materi dan buat catatan kecil.",
    "Saya bisa bantu! Coba tanyakan dengan lebih spesifik agar saya paham.",
    "Menurut saya, kunci sukses adalah konsistensi. Lakukan sedikit tapi setiap hari.",
    "Kreativitas itu penting! Coba luangkan waktu untuk brainstorming tanpa tekanan.",
];

function getFallbackResponse(input) {
    const lower = input.toLowerCase();
    if (lower.includes('resep') || lower.includes('masak') || lower.includes('kue')) {
        return '🍰 Resep sederhana: Campur 200gr tepung, 150gr gula, 3 telur, 100gr mentega, 1sdt baking powder. Panggang 180°C selama 30 menit. Selamat mencoba!';
    }
    if (lower.includes('pr') || lower.includes('sekolah') || lower.includes('belajar')) {
        return '📚 Untuk PR, coba bagi tugas menjadi bagian kecil. Kerjakan 25 menit, istirahat 5 menit. Ulangi sampai selesai. Semangat!';
    }
    if (lower.includes('kerja') || lower.includes('karir') || lower.includes('bisnis')) {
        return '💼 Dalam dunia kerja, komunikasi dan adaptasi adalah kunci. Jangan takut bertanya dan selalu belajar hal baru.';
    }
    if (lower.includes('coding') || lower.includes('program') || lower.includes('website')) {
        return '💻 Untuk coding, mulai dari dasar: HTML, CSS, JavaScript. Banyak sumber gratis di internet. Saya siap bantu!';
    }
    if (lower.includes('motivasi') || lower.includes('semangat')) {
        return '🔥 Kamu hebat! Setiap langkah kecil membawa perubahan besar. Teruslah bergerak maju!';
    }
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}