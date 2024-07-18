import { Router } from 'express'

import dbValidator from '@middlewares/validators/db.mjs'

import userRoute from '@routes/DatabaseA/user.mjs'
import deliveryNoteRoute from '@routes/DatabaseA/delivery_note.mjs'
import gaInventarisRoute from '@routes/DatabaseA/ga_inventaris.mjs'
import hrRoute from '@routes/DatabaseA/hr.mjs'
import phonebookRoute from '@routes/DatabaseA/phonebook.mjs'
import authRoute from '@routes/DatabaseA/auth.mjs'
import reservationRoute from '@routes/DatabaseA/reservation.mjs'
import okmRoute from '@routes/DatabaseA/okm.mjs'

const route = Router()

route.get('/', dbValidator('DatabaseA'), (req, res) => {
  res.status(200).json({message: `Database A route`});
});

route.use('/user', userRoute)
route.use('/deliverynote', deliveryNoteRoute)
route.use('/gainventaris', gaInventarisRoute)
route.use('/hr', hrRoute)
route.use('/phonebook', phonebookRoute)
route.use('/auth', authRoute)
route.use('/reservation', reservationRoute)
route.use('/okm', okmRoute)

export default route