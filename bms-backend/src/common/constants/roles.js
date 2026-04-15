const USER_ROLES = Object.freeze({
    ADMIN: "admin",
    USER: "user"
});

const ALLOWED_USER_ROLES = Object.values(USER_ROLES);

export {
    USER_ROLES,
    ALLOWED_USER_ROLES
};
