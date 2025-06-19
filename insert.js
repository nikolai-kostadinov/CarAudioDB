// insert.js
const { MongoClient } = require("mongodb");

async function run() {
  const client = new MongoClient("mongodb://localhost:27017");
  try {
    await client.connect();
    const db = client.db("CarAudio");

    // Вмъкване на продукти
    await db.collection("products").insertMany([
      { name: "Helix B 62C.2", type: "speaker", brand: "Helix", price: 190, specs: { watts: 240 }, tags: ["component", "2-way"] },
      { name: "Ground Zero GZIA", type: "amplifier", brand: "Ground Zero", price: 270, specs: { channels: 4 }, tags: ["high power"] },
      { name: "Match PP 86DSP", type: "amplifier", brand: "Match", price: 560, specs: { dsp: true }, tags: ["DSP"] },
      { name: "JBL Stage3", type: "speaker", brand: "JBL", price: 120, specs: { watts: 300 }, tags: ["coaxial"] },
      { name: "Sony XM-GS4", type: "amplifier", brand: "Sony", price: 250, specs: { channels: 4 }, tags: ["4-channel"] },
      { name: "Kicker CCA", type: "cable", brand: "Kicker", price: 40, specs: { length: "5m" }, tags: ["power"] },
      { name: "Kenwood KFC", type: "speaker", brand: "Kenwood", price: 60, specs: { watts: 300 }, tags: ["2-way"] },
      { name: "Rockford P3D4", type: "subwoofer", brand: "Rockford", price: 180, specs: { size: "12in" }, tags: ["bass"] },
      { name: "Infinity REF6522IX", type: "speaker", brand: "Infinity", price: 85, specs: { watts: 180 }, tags: ["2-way"] },
      { name: "Pioneer TS-A1670F", type: "speaker", brand: "Pioneer", price: 95, specs: { watts: 320 }, tags: ["3-way"] }
    ]);

    // Вмъкване на марки
    await db.collection("brands").insertMany([
      { name: "Helix", country: "Germany", founded: 1989 },
      { name: "Ground Zero", country: "Germany", founded: 1995 },
      { name: "Match", country: "Germany", founded: 2003 },
      { name: "JBL", country: "USA", founded: 1946 },
      { name: "Sony", country: "Japan", founded: 1946 },
      { name: "Kenwood", country: "Japan", founded: 1946 },
      { name: "Rockford", country: "USA", founded: 1973 },
      { name: "Infinity", country: "USA", founded: 1968 },
      { name: "Pioneer", country: "Japan", founded: 1938 },
      { name: "Kicker", country: "USA", founded: 1973 }
    ]);

    // Вмъкване на клиенти
    await db.collection("customers").insertMany([
      { name: "Ivan Petrov", email: "ivan@example.com", age: 30, address: { city: "Sofia", country: "Bulgaria" }, phones: ["0888123456"] },
      { name: "Petya Koleva", email: "petya@example.com", age: 28, address: { city: "Varna" }, phones: ["0888999999", "0888111111"] },
      { name: "Georgi Marinov", email: "georgi@example.com", age: 35, address: { city: "Plovdiv" }, phones: [] },
      { name: "Stoyan Dimitrov", email: "stoyan@example.com", age: 40, address: { city: "Burgas" }, phones: ["0899222333"] },
      { name: "Desi Nikolova", email: "desi@example.com", age: 22, address: { city: "Ruse" }, phones: ["0877123456"] },
      { name: "Maria Petrova", email: "maria@example.com", age: 32, address: { city: "Stara Zagora" }, phones: ["0897112233"] },
      { name: "Nikolay Ivanov", email: "nikolay@example.com", age: 27, address: { city: "Pleven" }, phones: ["0888444555"] },
      { name: "Tanya Georgieva", email: "tanya@example.com", age: 25, address: { city: "Shumen" }, phones: ["0899777666"] },
      { name: "Krasimir Yordanov", email: "krasimir@example.com", age: 33, address: { city: "Blagoevgrad" }, phones: ["0888999988"] },
      { name: "Dimitar Vasilev", email: "dimitar@example.com", age: 31, address: { city: "Dobrich" }, phones: ["0877555666"] }
    ]);

    // Вмъкване на поръчки
    await db.collection("orders").insertMany([
      { customer: "Ivan Petrov", date: "2025-06-20", products: ["JBL Stage3", "Sony XM-GS4"], total: 370 },
      { customer: "Petya Koleva", date: "2025-06-21", products: ["Match PP 86DSP"], total: 560 },
      { customer: "Georgi Marinov", date: "2025-06-22", products: ["Ground Zero GZIA", "Infinity REF6522IX"], total: 355 },
      { customer: "Stoyan Dimitrov", date: "2025-06-23", products: ["Helix B 62C.2", "Rockford P3D4"], total: 370 },
      { customer: "Desi Nikolova", date: "2025-06-24", products: ["Kenwood KFC", "Kicker CCA"], total: 100 },
      { customer: "Maria Petrova", date: "2025-06-25", products: ["Pioneer TS-A1670F"], total: 95 },
      { customer: "Nikolay Ivanov", date: "2025-06-26", products: ["Helix B 62C.2"], total: 190 },
      { customer: "Tanya Georgieva", date: "2025-06-27", products: ["Ground Zero GZIA"], total: 270 },
      { customer: "Krasimir Yordanov", date: "2025-06-28", products: ["Sony XM-GS4"], total: 250 },
      { customer: "Dimitar Vasilev", date: "2025-06-29", products: ["Rockford P3D4"], total: 180 }
    ]);

    // Вмъкване на служители
    await db.collection("employees").insertMany([
      { name: "Maria Dimitrova", position: "Sales", phone: "0888123456", experience: 3 },
      { name: "Ivan Georgiev", position: "Technician", phone: "0888111222", experience: 5 },
      { name: "Katerina Ilieva", position: "Manager", phone: "0888999888", experience: 7 },
      { name: "Viktor Todorov", position: "Installer", phone: "0888222333", experience: 4 },
      { name: "Petar Stefanov", position: "Sales", phone: "0888000011", experience: 2 },
      { name: "Aleksandar Dimitrov", position: "Warehouse", phone: "0888555444", experience: 3 },
      { name: "Svetla Hristova", position: "Support", phone: "0888777666", experience: 6 },
      { name: "Boris Ivanov", position: "Technician", phone: "0888999777", experience: 5 },
      { name: "Elena Petkova", position: "Sales", phone: "0888333222", experience: 2 },
      { name: "Milen Vasilev", position: "Installer", phone: "0888111000", experience: 4 }
    ]);

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
