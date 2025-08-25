'use server'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
	api_key: process.env.CLOUDINARY_API_KEY!,
	api_secret: process.env.CLOUDINARY_API_SECRET!
})

export async function uploadProfileImage(formData: FormData, folder="upload") {
	const file = formData.get('file') as File
	if (!file) throw new Error('No file uploaded')

	const arrayBuffer = await file.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)

	const result = await new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					folder: `rW/${folder}`,
					resource_type: 'image'
				},
				(error, result) => {
					if (error) reject(error)
					else resolve(result)
				}
			)
			.end(buffer)
	})

	return result
}

export async function deleteProfileImage(publicId: string) {
	if (!publicId) throw new Error('Public ID is required')

	const result = await cloudinary.uploader.destroy(publicId)

	return result
}
