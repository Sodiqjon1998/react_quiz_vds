function Darslar() {
  const lessons = [
    { id: 1, title: 'Matematika asoslari', progress: 100 },
    { id: 2, title: 'Fizika darslari', progress: 75 },
    { id: 3, title: 'Ingliz tili', progress: 50 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Darslar</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map(lesson => (
          <div key={lesson.id} className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">{lesson.title}</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${lesson.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{lesson.progress}% bajarilgan</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Darslar;