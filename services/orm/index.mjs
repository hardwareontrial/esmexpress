import orm from '@services/orm/sequelize.mjs'

// Models
import '@models/DatabaseA/hr.mjs'
import '@models/DatabaseA/user.mjs'
import '@models/DatabaseA/authorization.mjs'
import '@models/DatabaseA/delivery_note.mjs'
import '@models/DatabaseA/ga_inventaris.mjs'
import '@models/DatabaseA/reservation.mjs'
import '@models/DatabaseA/phonebook.mjs'
import '@models/DatabaseA/simple_todo.mjs'
import '@models/DatabaseA/app_jobs.mjs'
import '@models/DatabaseA/app_log.mjs'
import '@models/DatabaseA/okm.mjs'
import '@models/DatabaseB/fingerspot.mjs'

// Relation
import '@models/relations/DatabaseA/hr.mjs'
import '@models/relations/DatabaseA/user.mjs'
import '@models/relations/DatabaseA/authorization.mjs'
import '@models/relations/DatabaseA/delivery_note.mjs'
import '@models/relations/DatabaseA/ga_inventaris.mjs'
import '@models/relations/DatabaseA/reservation.mjs'
import '@models/relations/DatabaseA/phonebook.mjs'
import '@models/relations/DatabaseA/simple_todo.mjs'
import '@models/relations/DatabaseA/okm.mjs'
import '@models/relations/DatabaseB/fingerspot.mjs'

// console.log(orm)
export default orm