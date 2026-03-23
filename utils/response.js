export function success(res, data) {
    return res.status(200).json({
        success: true,
        data
    });
}

export function error(res, message, code = 400) {
    return res.status(code).json({
        success: false,
        error: message
    });
}