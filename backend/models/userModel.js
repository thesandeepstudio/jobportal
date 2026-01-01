const db = require("../config/db");

exports.createUser = async (email, password, mobile, role) => {
    const sql = `
        INSERT INTO users (email, password, mobile, role)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [email, password, mobile, role]);
    return result.insertId;
};

exports.findUserByEmail = async (email) => {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
};
