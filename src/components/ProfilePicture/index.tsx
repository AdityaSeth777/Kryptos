import Jazzicon from 'react-jazzicon/dist/Jazzicon'

export default function ProfilePicture({
  address,
  size,
}: {
  address: string
  size?: number
}) {
  return (
    <div
      className="picture"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Jazzicon
        diameter={size ?? 70}
        seed={parseInt(address.slice(2, 10), 16)}
      />
    </div>
  )
}
