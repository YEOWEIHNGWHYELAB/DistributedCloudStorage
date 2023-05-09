exports.initpgdb = async (pool, sqlScript) => {
    try {
        await pool.query(sqlScript);
        console.log(`Completed initialization to database: ${process.env.DBNAME}`);
    } catch(error) {
        console.log("Error connecting to PostgreSQL database", error);
    }
};
