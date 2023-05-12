exports.initpgdb = async (pool, sqlScript, dbName) => {
    try {
        await pool.query(sqlScript);
        console.log(`Completed initialization to database: ${dbName}`);
    } catch(error) {
        console.log("Error connecting to PostgreSQL database", error);
    }
};

exports.testPGConnection = async (pool) => {
    try {
        const resultTime = await pool.query('SELECT NOW()');
        console.log('Connected to PostgresDB at', resultTime.rows[0].now);
    } catch(error) {
        console.error('Error connecting to Postgres Database', error);
    }
}
