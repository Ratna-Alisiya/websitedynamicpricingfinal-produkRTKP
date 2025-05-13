
function interpretData(data) {
  const { r, g, b, ph, mikroba, suhu } = data;

  const isClose = (a, b, tolerance = 25) => Math.abs(a - b) <= tolerance;
  let colorQuality = "Tidak Dikenali";

  if (isClose(r, 170) && isClose(g, 90) && isClose(b, 60)) colorQuality = "Merah Kecoklatan";
  else if (isClose(r, 240) && isClose(g, 150) && isClose(b, 100)) colorQuality = "Merah Muda";
  else if (isClose(r, 255) && isClose(g, 255) && isClose(b, 100)) colorQuality = "Kuning Cerah";

  let overallQuality = "Tidak Layak Konsumsi";

  if (ph <= 5.8 && mikroba <= 3.2e3 && suhu <= 7 && colorQuality === "Merah Kecoklatan")
    overallQuality = "Sangat Layak untuk Konsumsi";
  else if (ph <= 6.2 && mikroba <= 5.8e4 && suhu <= 15 && (colorQuality === "Merah Kecoklatan" || colorQuality === "Merah Muda"))
    overallQuality = "Layak untuk Konsumsi";
  else if (ph <= 6.8 && mikroba <= 1.1e6 && suhu <= 22 && (colorQuality === "Merah Muda" || colorQuality === "Kuning Cerah"))
    overallQuality = "Batas Kelayakan Konsumsi";

  return { overallQuality, colorQuality };
}

function getPriceByQuality(quality) {
  switch (quality) {
    case "Sangat Layak untuk Konsumsi": return "Rp 15.000";
    case "Layak untuk Konsumsi": return "Rp 12.000";
    case "Batas Kelayakan Konsumsi": return "Rp 6.000";
    default: return "Harga tidak tersedia";
  }
}

function updateDisplay(data) {
  const result = interpretData(data);
  const price = getPriceByQuality(result.overallQuality);
  document.getElementById("quality").innerText = `Kualitas: ${result.overallQuality} (Indikator: ${result.colorQuality})`;
  document.getElementById("price").innerText = "Harga: " + price;
}

function extractRGBFromQR(text) {
  try {
    const data = JSON.parse(text);
    if (data.r !== undefined && data.g !== undefined && data.b !== undefined &&
        data.ph !== undefined && data.mikroba !== undefined && data.suhu !== undefined) {
      updateDisplay(data);
    } else {
      document.getElementById("quality").innerText = "Data tidak lengkap dalam QR.";
    }
  } catch (e) {
    document.getElementById("quality").innerText = "Format QR tidak sesuai.";
  }
}

const html5QrCode = new Html5Qrcode("reader");
Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length) {
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        html5QrCode.stop();
        extractRGBFromQR(decodedText);
      }
    );
  }
}).catch(err => {
  document.getElementById("quality").innerText = "Error: " + err;
});

function generateQR() {
  const r = parseInt(document.getElementById("r").value);
  const g = parseInt(document.getElementById("g").value);
  const b = parseInt(document.getElementById("b").value);
  const ph = parseFloat(document.getElementById("ph").value);
  const mikroba = parseFloat(document.getElementById("mikroba").value);
  const suhu = parseFloat(document.getElementById("suhu").value);

  if ([r, g, b, ph, mikroba, suhu].some(isNaN)) {
    alert("Harap isi semua nilai RGB, pH, mikroba, dan suhu dengan benar.");
    return;
  }

  const qr = new QRious({
    element: document.getElementById("qrCanvas"),
    size: 200,
    value: JSON.stringify({ r, g, b, ph, mikroba, suhu })
  });
}
