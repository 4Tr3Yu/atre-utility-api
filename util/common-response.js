
export const setResponseWithError = (res, status, message, code = 'error') => {
    return res.status(status).send({ code, message });
}

export const setResponseWithOk = (res, status, message, code = 'ok') => {
    return res.status(status).send({ code, message });
}

export const setResponseRaw = (res, status, message) => {
    return res.status(status).send(message);
}
