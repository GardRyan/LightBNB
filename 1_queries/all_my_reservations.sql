SELECT reservations.id AS id, 
       properties.title AS title, 
       properties.cost_per_night AS cost_per_night, 
       reservations.start_date AS start_date, 
       AVG(property_reviews.rating) AS average_rating
FROM reservations
JOIN properties ON properties.id = reservations.property_id
JOIN property_reviews ON property_reviews.property_id = reservations.property_id
JOIN users ON users.id = property_reviews.guest_id
WHERE users.id = 1
GROUP BY reservations.id, 
         properties.title, 
         properties.cost_per_night, 
         reservations.start_date
ORDER BY start_date DESC
LIMIT 10;
