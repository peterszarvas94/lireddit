# lireddit

### [Course](https://youtu.be/I6ypD7qv3Z8?t=50210) by Ben Awad

Domain on [Websupport](https://admin.websupport.hu/hu/dashboard/service/1394095)

Frontend: [https://playingdeer.hu/](https://playingdeer.hu/)
Hosted on [Vercel](https://vercel.com/peterszarvas94/lireddit)

Backend: [https://api.playingdeer.hu/](https://api.playingdeer.hu/)
Hosted on [Digital ocean](https://cloud.digitalocean.com/projects/ae2e3c92-d83b-4f76-b38c-09d52d20b605/resources?i=b7b469)
```
ssh root@164.92.196.23
read version
docker pull peterszarvas94/lireddit:$version && docker tag peterszarvas94/lireddit:$version dokku/api:$version && dokku deploy api $version
```