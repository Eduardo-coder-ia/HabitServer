import dayjs from 'dayjs'
import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { prisma } from "./lib/prisma"

export async function appRoutes(app: FastifyInstance) { // rota criada para meu hábito
    app.post('/habits', async (request) => { // no parametro preciso buscar title, e weekDays
   const createHabitBody = z.object({
    title:  z.string(),
    weekDays: z.array(
        z.number().min(0).max(6)
        )
   })
        const { title, weekDays } = createHabitBody.parse(request.body) // usei para obter o corpo da função para criação e atualização de algum recurso

      const today = dayjs().startOf('day').toDate()
      
        await prisma.habit.create({
           data: {
            title,
            created_at: today,
            weekDays: {
                create: weekDays.map(weekDay => {
                    return {
                        week_day: weekDay,
                    }
                })
            }
           } 
        })
    })

 app.get('/day', async (request) => {
    const getDayParams = z.object({
        date: z.coerce.date()
  })

  const { date } = getDayParams.parse(request.query)
 // todos hábitos possíveis
 // hábitos que já foram completados


const parsedDate = dayjs(date).startOf('day')
 const weekDay = parsedDate.get('day')



 const possibleHabits = await prisma.habit.findMany({
    where: {
        created_at: {
          lte: date,  
        }, 
        weekDays: {
            some: {
                week_day: weekDay,
            }
        }
    }
 })


 const day = await prisma.day.findUnique({
   where: {
    date: parsedDate.toDate(),
   },
   include: {
    dayHabits: true,
   }
 })

 const completedeHabits = day?.dayHabits.map(dayHabit => {
    return dayHabit.habit_id
 })
 
 return {
    possibleHabits,
    completedeHabits, 
 }
})   

// Completar Ou não completar um hábito 

    app.patch('/habits/:id/toggle', async  (request) => {
        // route param => parametro de indentificação

        const toggleHabitParams = z.object({
            id: z.string().uuid(),
        })
        
        const { id } = toggleHabitParams.parse(request.params)
    
        const today = dayjs().startOf('day').toDate()

        let day = await prisma.day.findUnique({
            where: {
                date:today,
            }
        })
    
        if (!day) {
            day = await prisma.day.create({
                data: {
                    date: today
                }
            })
            
        }

        const dayHabit = await prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id,
                }
            }
        })

        if (dayHabit) {
            //Remover a marcação de complete
            await prisma.dayHabit.delete({
                where: { 
                   id: dayHabit.id,
                }
            }) 
        } else {
            await prisma.dayHabit.create({
                data:{
                    day_id: day.id,
                    habit_id: id,
                }
            })
        }


        // Completar o hábito 
        await prisma.dayHabit.create({
            data: {
                day_id: day.id,
                habit_id: id,
            }
        })

    })

}


