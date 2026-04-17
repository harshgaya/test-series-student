export function successResponse(data, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function errorResponse(error, status = 400) {
  return Response.json({ success: false, error }, { status })
}
