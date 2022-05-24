# DDOS Protocol

Incase of a DDOS attack, the following steps should be taken to stop the attack:

1. Check if the attack is coming from a known source by verifying the logs
2. If step 1 is true, add the IP to the [blacklist](../blacklist.json)
3. Check if the attack abuses a specific endpoint
4. If step 3 is true, temporarily block the endpoint if it's non essential and attempt to find the weak point
