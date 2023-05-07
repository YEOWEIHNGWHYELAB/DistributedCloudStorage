exports.createRequiredFileTable = async function(username, pool) {
    const file_partitioning_query = `
        CREATE TABLE GitHubFiles_${username} 
        PARTITION OF GitHubFiles
        FOR VALUES IN ('${username}')`;

    try {
        return await pool.query(file_partitioning_query);
    } catch (error) {
        console.log(error);
    }
}
