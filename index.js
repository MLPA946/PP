const sql = require('mssql');
const fetch = require('node-fetch');

const config = {
    user: 'YOUR_DB_USERNAME',
    password: 'YOUR_DB_PASSWORD',
    server: 'YOUR_SERVER.database.windows.net',
    database: 'YOUR_DATABASE_NAME',
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

async function populateProductsTable() {
    try {
        const response = await fetch('https://mdn.github.io/learning-area/javascript/apis/fetching-data/can-store/products.json');
        const products = await response.json();

        const pool = await sql.connect(config);
        const checkQuery = 'SELECT COUNT(*) AS count FROM Products';
        const result = await pool.request().query(checkQuery);

        if (result.recordset[0].count === 0) {
            for (const product of products) {
                const request = pool.request();
                request.input('name', sql.NVarChar, product.name);
                request.input('price', sql.Decimal(10, 2), product.price);
                request.input('image', sql.NVarChar, product.image);
                request.input('type', sql.NVarChar, product.type);

                const insertQuery = `
                    INSERT INTO Products (name, price, image, type)
                    VALUES (@name, @price, @image, @type)
                `;
                await request.query(insertQuery);
            }
            console.log(`✅ Products table populated with ${products.length} items.`);
        } else {
            console.log('⚠️ Products table already has data.');
        }

        await sql.close();
    } catch (err) {
        console.error('❌ Error populating Products table:', err);
    }
}

populateProductsTable();
