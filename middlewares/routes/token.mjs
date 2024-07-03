import jwt from 'jsonwebtoken'

const checkToken = (req, res, next) => {
  try {
    const bearerHeader = req.headers['authorization'];
    const uniqueSession = req.headers['x-unique-session']
    if(!bearerHeader){ return res.status(403).json({message: 'Forbidden. No token provided.'}) }
    
    const token = bearerHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.APP_SECRET_KEY);
    let userAuthenticated = {
      user_id: decoded.user_id,
      user_auth_id: decoded.user_auth_id,
      user_nik: decoded.user_nik,
      user_s_nik: decoded.user_s_nik,
      user_email: decoded.user_email,
      uniqueSession: uniqueSession,
    };
    req.userAuthenticated = userAuthenticated;
    next();
  } catch (error) {
    res.status(401).json({message: 'Token not valid.'});
  }
}

export default checkToken