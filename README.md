# Awesome Reservation BE

Base on the [reservation kata](https://hackmd.io/@spira-mirabilis/S1jKRqQKO)

## Usage

To start development, run the following command:

```bash
# Prepare the table:
git clone git@github.com:DrTtnk/reservations.git
cd reservations
npm install

# Run the development environment:
docker-compose up -d postgres && npm run dev

# And when you're done, to close everything:
docker-compose down
```

To start the docker environment:

```bash
docker-compose up --abort-on-container-exit --build
```

To test it locally:

```bash
npm run test
```

To upgrade all dependencies:

```bash
npm run upgrade
```
