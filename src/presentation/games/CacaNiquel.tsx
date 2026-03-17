import cacaNiquelImagem from '../../assets/CacaNiquel.png';

export const CacaNiquel = () => (
  <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <header className="text-center">
      <h1 className="text-2xl font-bold text-slate-900">Caça-níquel</h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder para testes e futura estilização.
      </p>
    </header>

    <div className="mt-6 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6">
      <img
        src={cacaNiquelImagem}
        alt="Imagem placeholder de um caça-níquel"
        className="max-w-none w-[1200px] h-[1000px]"
      />
      <p className="mt-4 text-center text-sm text-slate-500">
        Imagem base para testes e futura estilização da sala.
      </p>
    </div>
  </section>
);
