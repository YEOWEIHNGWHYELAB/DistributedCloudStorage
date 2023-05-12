exports.initpgdb = async (pool, sqlScript) => {
    try {
        await pool.query(sqlScript);
        console.log(`Completed initialization to database: ${process.env.DBNAME}`);
    } catch(error) {
        console.log("Error connecting to PostgreSQL database", error);
    }
};

exports.testPGConnection = async (pool) => {
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Error connecting to Postgres Database', err);
        } else {
            console.log('Connected to the Postgres Database at', res.rows[0].now);
        }
    });
}
