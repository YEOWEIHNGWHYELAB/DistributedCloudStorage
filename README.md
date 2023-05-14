# DistributedCloudStorage

Using services in the way that they they are not intended for. Platforms like Google and Meta provided social media broadcasting can be useful for us to make a distributed file system for us to use it as a general purpose storage device. Google Drive does provide storage for all file types but only provides 15 GB of free storage.

## To-Do

1) YouTubeAPI

- Currently there is no category settings for video uploaded
- No meta data other than video title (To be stored in MongoDB), we already have the collection which is called mongoYTMetaCollection on app.js

## WARNING

There is a potential risk of losing your account if this application is used as it might violate the terms of use of these service provider as we are not using it for social media purposes but for our own archival purpose.

This is mainly a testing project for fun. Use it at your own risk!

## Cloud File Types Storage Service Provider

1) Videos

- YouTube
- Instagram
- Facebook
- TikTok
- Twitter

2) Photos

- Instagram
- Facebook
- TikTok
- Twitter

3) Text Files

- Google Drive
- GitHub
- Facebook
- Instagram

4) Documents

- Google Drive
- GitHub

## Documents Storage

If we use Google Drive, we could store any form of documents, but only word, excel and power point will have version history. Moreover we have a limited amount of storage of only 15 GB.

If we use GitHub, we have version control history for any documents, however you will have to make snapshots of version by developing the auto commiting and and automating the version control unlike application like Google Docs. But the upside is that you do not have a limit on the number of repositories you can have on GitHub, but there is a max file size limit you can have.

## Photos

Using social media platforms like facebook can allow you to save photos. However you have to be mindful on the quality of your photos as those media files will be compressed when you upload to these social media platform. There shouldn't be any photo upload limit other than the fact that you can only have 1000 photos per album. But also do keep in mind that you will have to set photo privacy to avoid these sensitive photo of yours from being viewed by the public.
