const HeadCard = ({
  name = "Head 1",
  role = "ISEP Head",
  description = "ISEP Head responsible for supporting and coordinating ISEP member activities.",
  image = "",
}) => {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      
      {/* Profile Image */}
      <div className="flex h-48 items-center justify-center bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={`${name} profile`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-semibold text-gray-500">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-5 text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          {name}
        </h3>

        <p className="mt-1 text-sm font-medium text-gray-600">
          {role}
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HeadCard;