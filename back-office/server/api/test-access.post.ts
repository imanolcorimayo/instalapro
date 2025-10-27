import { defineEventHandler, readBody, createError } from 'h3'
import { getFirebaseAdminAuth } from '~/server/utils/firebaseAdmin'

interface TestAccessRequestBody {
  code?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<TestAccessRequestBody>(event)
  const code = body?.code?.trim()

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'CODE_REQUIRED',
      message: 'Debes ingresar un código de acceso.'
    })
  }

  const config = useRuntimeConfig(event)
  const expectedCode = (config.testAccessCode as string | undefined)?.trim()

  if (!expectedCode) {
    throw createError({
      statusCode: 500,
      statusMessage: 'TEST_ACCESS_NOT_CONFIGURED',
      message: 'El acceso de prueba no está configurado.'
    })
  }

  if (code !== expectedCode) {
    throw createError({
      statusCode: 401,
      statusMessage: 'INVALID_CODE',
      message: 'El código ingresado no es válido.'
    })
  }

  const testUserUid = (config.testUserUid as string | undefined)?.trim()

  if (!testUserUid) {
    throw createError({
      statusCode: 500,
      statusMessage: 'TEST_USER_NOT_CONFIGURED',
      message: 'No se configuró el usuario de prueba.'
    })
  }

  const auth = getFirebaseAdminAuth({
    firebaseServiceAccount: config.firebaseServiceAccount as string | Record<string, any> | undefined
  })

  try {
    await auth.getUser(testUserUid)
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'TEST_USER_NOT_FOUND',
      message: 'El usuario de prueba no existe en Firebase Auth.'
    })
  }

  const customToken = await auth.createCustomToken(testUserUid, {
    isTestAccess: true
  })

  return {
    token: customToken
  }
})
