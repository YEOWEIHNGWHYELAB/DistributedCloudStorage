import React, { useState } from "react";

const parseClientSecret = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const content = JSON.parse(reader.result);
                const { client_id, client_secret, redirect_uris } = content.web;

                // If you have multiple uris, please put the domain you are 
                // using as the first one
                const redirect_uri = redirect_uris[0];

                const parsedData = {
                    yt_client_id: client_id,
                    yt_client_secret: client_secret,
                    yt_redirect_uri: redirect_uri,
                };

                resolve(parsedData);
            } catch (error) {
                reject(new Error('Error parsing client secret file.'));
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

export default parseClientSecret;
