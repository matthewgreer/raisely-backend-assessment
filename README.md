# Back End Assessment for Raisely

Repo for Back-End Assessment Exercise During Raisely Interview Process

- [NodeJS](https://nodejs.org/en/download)
- `npm i` to install dependencies
- `npm run start` start server on http://localhost:8080


## Task
For this assessment I'll produce a simplified version of the Raisely API for managing profiles and donations, implementing the following endpoints:
```
GET  /profiles                    - Fetch all profiles
GET  /profiles/:profile/donations - Fetch a single profile's donations
POST /profiles/:profile/donations - Submit a new donation to the profile with the given ID
POST /donations                   - Submit a new donation to the campaign
```

### Profiles
```
id - A unique identifier, UUID v4
name - The display name for the profile
total - The total amount raised, in cents
parentId - The id of the profile that this profile belongs to. An ID of null indicates that the profile belongs is the root campaign profile
currency - The currency the profile is tracking their total in
```
Fundraising profiles are hierarchical, a profile uses its `parentId` field to indicate which profile it belongs to. For example several individuals fundraising profiles (Jack, Jane and John) might belong to a team profile (Team Can Do!).

All profiles in a fundraising campaign are connected in a tree with a single campaign profile at the top. In the previous example the team profile might belong directly to the campaign profile. Each campaign only has a single campaign profile, and all profiles are eventually connected back to the campaign profile via their parents.

This hierarchy is particularly important when it comes to the `total` value on a profile. When a donation is made to a profile, it's value is attributed to the immediate profile, and also all of its parents. For example, if I donate $10 to Jane, the `total` field on her individual fundraising profile would increase by $10, as would the Team Can Do profile (as her team) and the campaign profile it was connected to.


### Donations
```
id - A unique identifier, UUID v4
donorName - The full name of the person making the donation
amount - The amount being donated, in cents
currency - The currency the donation is made in
profileId - The profile the donation is made to
```
Raisely also supports donating, and tracking fundraising total, in multiple currencies. For example I could make a $10 AUD donation to Jane, and her `total` would increase by $7.40 if she is tracking her fundraising in USD.
### Currencies
```
USD to USD: 1
AUD to USD: 0.74
EUR to USD: 1.18
```

## Requirements
- Implement all the endpoints described above
- Accommodate hierarchical profile totals and exchange rates
- I'll use Node.js, Express.js, Nodemon, Jest, and Supertest
- API & source must be publicly visible

## Not Required
- Authentication or permissions
  - Assume any requests have already been authorized and are allowed to perform the specified action
- Persistence
  - Persist in memory, but consider the performance of API as if it made asynchronous reads/writes to a database
- Payment processing
  - in places in the code when a charge should be made, insert `// charge card here`

## What They're Looking For
- **Correctness**: Your implementation should work correctly. We should be able to create  donations in a variety of currencies and we should see the totals on all of the fundraising profiles return expected results

- **Quality**: Your code should be well structured, and following best practices. It should be representative of the kind of code you'd produce in if you were working with us

- **Testing**: You should write some basic tests to assert your endpoints work as expected
