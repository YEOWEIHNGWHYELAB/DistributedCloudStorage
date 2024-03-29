exports.createRequiredFileTable = async function(username, pool) {
    const githubfile_partitioning_query = `
        CREATE TABLE GitHubFiles_${username} 
        PARTITION OF GitHubFiles
        FOR VALUES IN ('${username}')
    `;
    
    const ytfile_partitioning_query = `
        CREATE TABLE YouTubeVideos_${username} 
        PARTITION OF YouTubeVideos
        FOR VALUES IN ('${username}')
    `;

    try {
        const gh_query_res = await pool.query(githubfile_partitioning_query);
        const yt_query_res = await pool.query(ytfile_partitioning_query);

        return { success: true };
    } catch (error) {
        // console.log(error);
        return { success: false, message: error };
    }
}

exports.createRequiredRootDirSMCO = async function(username, pool) {
    const createRootDir = `
        INSERT INTO FileSystemPaths (username, path_name, path_level) 
            VALUES ($1, $2, $3)
    `;

    try {
        const newRootDir = await pool.query(createRootDir, [username, '', 0]);

        return { success: true };
    } catch (error) {
        // console.log(error);
        return { success: false, message: error };
    }
}
