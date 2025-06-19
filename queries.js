// queries.js
const { MongoClient } = require("mongodb");

async function run() {
  const client = new MongoClient("mongodb://localhost:27017");
  try {
    await client.connect();
    const db = client.db("CarAudio");

    // === PRODUCTS ===

    // Всички продукти
    console.log(await db.collection("products").find({}).toArray());

    // Продукти на Helix
    console.log(await db.collection("products").find({ brand: "Helix" }).toArray());

    // Продукти на тип speaker и цена под 150
    console.log(await db.collection("products").find({ type: "speaker", price: { $lt: 150 } }).toArray());

    // Промяна на цена
    await db.collection("products").updateOne({ name: "JBL Stage3" }, { $set: { price: 110 } });

    // Изтриване на продукт
    await db.collection("products").deleteOne({ name: "Pioneer TS-A1670F" });

    // Групиране по тип и средна цена
    console.log(await db.collection("products").aggregate([
      { $group: { _id: "$type", avgPrice: { $avg: "$price" } } }
    ]).toArray());

    // === BRANDS ===

    // Всички марки
    console.log(await db.collection("brands").find({}).toArray());

    // Марки от Германия
    console.log(await db.collection("brands").find({ country: "Germany" }).toArray());

    // Марки основани преди 1970
    console.log(await db.collection("brands").find({ founded: { $lt: 1970 } }).toArray());

    // Актуализиране на страна
    await db.collection("brands").updateOne({ name: "Infinity" }, { $set: { country: "Germany" } });

    // Изтриване на марка
    await db.collection("brands").deleteOne({ name: "Kicker" });

    // Групиране по страна и брой марки
    console.log(await db.collection("brands").aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } }
    ]).toArray());

    // === CUSTOMERS ===

    // Всички клиенти
    console.log(await db.collection("customers").find({}).toArray());

    // Клиенти от Варна
    console.log(await db.collection("customers").find({ "address.city": "Varna" }).toArray());

    // Клиенти с повече от 1 телефон
    console.log(await db.collection("customers").find({ phones: { $size: 2 } }).toArray());

    // Актуализация на имейл
    await db.collection("customers").updateOne({ name: "Petya Koleva" }, { $set: { email: "petya.koleva@newmail.com" } });

    // Изтриване на клиент
    await db.collection("customers").deleteOne({ name: "Georgi Marinov" });

    // Средна възраст на клиентите
    console.log(await db.collection("customers").aggregate([
      { $group: { _id: null, avgAge: { $avg: "$age" } } }
    ]).toArray());

    // === ORDERS ===

    // Всички поръчки
    console.log(await db.collection("orders").find({}).toArray());

    // Поръчки на клиент Ivan Petrov
    console.log(await db.collection("orders").find({ customer: "Ivan Petrov" }).toArray());

    // Поръчки над 300 лв
    console.log(await db.collection("orders").find({ total: { $gt: 300 } }).toArray());

    // Актуализиране на сума
    await db.collection("orders").updateOne({ customer: "Desi Nikolova" }, { $set: { total: 110 } });

    // Изтриване на поръчка
    await db.collection("orders").deleteOne({ customer: "Tanya Georgieva" });

    // Обща сума на поръчките по клиент
    console.log(await db.collection("orders").aggregate([
      { $group: { _id: "$customer", totalSpent: { $sum: "$total" } } }
    ]).toArray());

    // === EMPLOYEES ===

    // Всички служители
    console.log(await db.collection("employees").find({}).toArray());

    // Служители с опит над 3 години
    console.log(await db.collection("employees").find({ experience: { $gt: 3 } }).toArray());

    // Служители с позиция Sales и опит 2
    console.log(await db.collection("employees").find({ position: "Sales", experience: 2 }).toArray());

    // Повишаване на опит
    await db.collection("employees").updateOne({ name: "Petar Stefanov" }, { $set: { experience: 3 } });

    // Изтриване на служител
    await db.collection("employees").deleteOne({ name: "Boris Ivanov" });

    // Среден опит по позиция
    console.log(await db.collection("employees").aggregate([
      { $group: { _id: "$position", avgExp: { $avg: "$experience" } } }
    ]).toArray());

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
