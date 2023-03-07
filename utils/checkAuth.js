import jwt from "jsonwebtoken";

export default (req, res, next) => {
    // логінимося чи реєструмося - отримуємо токен (сервер формує юзеру токен і відправляє на клієнт)
    // відправляємо цей токен при кожному запиті
    // checkAuth - розшифровуємо токен, щоб витащити з нього id юзера
    // передаємо id юзера далі в контролер
    // знаходимо в базі даних юзера, повертаємо на клієнт дані про юзера, якщо нічого не знайшли - значить клієнт не має доступу до сторінки

    // надсилаємо в запиті через хедери свій токен як клієнта, забираємо з нього слово Bearer
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

    // якщо токен є, розшифровуємо його
    if (token) {
        try {
            const decoded = jwt.verify(token, "secret123");
            // зберіг _id з токена (бо ми передавали саме _id в токен) в req.userId
            req.userId = decoded._id;
            next();
        } catch (err) {
            // статус 403 - немає доступу
            return res.status(403).json({
                message: "No access",
            });
        }
    } else {
        return res.status(403).json({
            message: "No access",
        });
    }
};
