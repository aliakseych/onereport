import authLandscapeImage from "../../../Gemini_Generated_Image_apm2daapm2daapm2.png";

export function UzbekLandscapeArt() {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-[2rem] bg-[#17312c] text-white shadow-ambient">
      <img
        alt="Горный пейзаж для экрана входа"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        src={authLandscapeImage}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-white/5" />

      <div className="relative flex h-full flex-col justify-end p-8 sm:p-10">
        <div className="max-w-md rounded-[1.5rem] bg-black/18 p-6 backdrop-blur-sm">
          <p className="text-sm font-semibold tracking-[0.12em] text-white/70">
            SolveIt
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-editorial">
            Спокойный вход в сервис городских обращений
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            Чистый входной экран с вашим изображением без лишнего визуального шума.
          </p>
        </div>
      </div>
    </div>
  );
}
