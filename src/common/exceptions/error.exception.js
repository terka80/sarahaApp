export const ApplicationException = ({
  message = "error",
  options = {
    cause: { status: 400 },
  },
} = {}) => {
  throw new Error(message, options);
};

export const ConflictException = (message = "Conflict", issues = {}) => {
  return ApplicationException({
    message,
    options: {
      status: 409,
      issues,
    },
  });
};
export const NotFoundException = (message = "Not Found", issues = {}) => {
  return ApplicationException({
    message,
    options: {
      status: 404,
      issues,
    },
  });
};
export const BadException = (message = "Bad Request", issues = {}) => {
  return ApplicationException({
    message,
    options: {
      status: 400  ,
      issues,
    },
  });
};
export const UnAuthorizedException = (message = "UnAuthorized", issues = {}) => {
  return ApplicationException({
    message,
    options: {
      status: 401,
      issues,
    },
  });
};
export const ForbiddenException = (message = "Forbidden", issues = {}) => {
  return ApplicationException({
    message,
    options: {
      status: 403,
      issues,
    },
  });
};
