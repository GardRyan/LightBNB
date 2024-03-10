const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Client } = require("pg");
const client = new Client();

client.connect((err) => {
  client.query("SELECT $1::text as message", ["Hello world!"], (err, res) => {
    console.log(err ? err.stack : res.rows[0].message); // Hello World!
    client.end();
  });
});

client.query(`SELECT title FROM properties LIMIT 10;`).then((response) => {
  console.log(response);
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return client
    .query(`SELECT * FROM user WHERE user.email = $1;`, [email])
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return client
    .query(`SELECT * FROM users WHERE user.id = $1;`, [id])
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return client
    .query(
      `INSERT into users (name, email, password) Values ($1, $2, $3) RETURNING *;`,
      [user.name, user.email, user.password]
    )
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, options = {}) {
  // Prepare the base query
  let query = `
    SELECT * FROM reservations 
    JOIN properties ON reservations.property_id = properties.id 
    JOIN property_reviews ON property_reviews.property_id = properties.id
    WHERE guest_id = $1`;

  // Prepare an array to hold the parameter values
  const queryParams = [guest_id];

  // Check if there are filtering options
  if (Object.keys(options).length > 0) {
    query += " AND";

    // City filter
    if (options.city) {
      query += " properties.city = $" + (queryParams.length + 1);
      queryParams.push(options.city);
    }

    // Minimum price per night filter
    if (options.minimum_price_per_night) {
      query += " AND properties.cost_per_night >= $" + (queryParams.length + 1);
      queryParams.push(options.minimum_price_per_night);
    }

    // Maximum price per night filter
    if (options.maximum_price_per_night) {
      query += " AND properties.cost_per_night <= $" + (queryParams.length + 1);
      queryParams.push(options.maximum_price_per_night);
    }

    // Minimum rating filter
    if (options.minimum_rating) {
      query += " AND property_reviews.rating >= $" + (queryParams.length + 1);
      queryParams.push(options.minimum_rating);
    }
  }

  // Add the limit clause to the query
  query += " LIMIT $" + (queryParams.length + 1);
  queryParams.push(options.limit || 10); // Default limit is 10 if not specified

  // Execute the query
  return client
    .query(query, queryParams)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
      throw err; // Propagate the error
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  return client
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  return client
  .query(`INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)  RETURNING *;`, [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
