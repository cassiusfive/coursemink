## About The Project

Mink is a student-oriented class scheduling tool designed to streamline the course registration process. You provide the classes you plan to take along with your preferences, and Mink finds the schedule that best fits your needs. Currently serving Oregon State University’s course catalog.

See it live [here](https://mink-client.fly.dev)!

## Built With

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## Getting Started

### Prerequisites

-   [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
-   [postgres](https://www.postgresql.org/download/)

### Installation

Create a Postgres DB and load course data to it using:

```sh
pg_restore -U username -d dbname < db.tar
```

Navigate to the server directory and install dependencies:

```sh
cd server && npm install
```

Create a .env in the server directory following this format:

```sh
# Express
PORT="3000"
HOST="127.0.0.1"

# Postgresql
DATABASE_URI="postgresql://username:password@127.0.0.1:port/dbname"
```

Now navigate to the client directory and install dependencies:

```sh
cd ../client && npm install
```

Create another .env pointing to the backend:

```sh
API_ENDPOINT="http://127.0.0.1/v1"
```

## Usage

To use the project run `npm run dev` in the server and client directories.

Then type “o” into the shell running Vite to open the site running locally in your browser.

## Roadmap

-   [ ] Export CRNs
-   [ ] View detailed course info
-   [ ] Favorite schedules
-   [ ] Scheduling Algorithm Overhaul
    -   [ ] Fitness Function redefinition
    -   [ ] Meta-heuristic local search
-   [ ] Mobile responsiveness

## Contributing

Any contributions to the project are **greatly appreciated**.

If you have a suggestion that would make this project better, please fork the repo and create a pull request. Don’t forget to give the project a star!

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m ‘Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the GNU General Public License v3.0. See `LICENSE.txt` for more information.

## Contact

If you have any questions about the project or just wanna chat, feel free to reach out to me!

Cassius V - cassiusfive@gmail.com

\****psssstt***\* *If you're an OSU student, let's do some hackathons*
