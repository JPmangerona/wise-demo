import Image from "next/image";
import Link from "next/link";
import { FolderOpen, CalendarCheck, BellRing, Wallet, ArrowRight, XCircle, CheckCircle2, MessageCircle, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-body selection:bg-[#0B132B] selection:text-white">
      {/* SEÇÃO 1: HERO */}
      <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden pt-12 lg:pt-0">

        {/* --- BACKGROUND GEOMÉTRICO (SÍMBOLOS AZUIS) --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Faixa menor inclinada */}
          <div className="absolute top-[-20%] bottom-[-20%] right-[35%] lg:right-[38%] w-16 lg:w-24 bg-[#0B132B] -skew-x-[25deg] shadow-2xl"></div>

          {/* Bloco principal inclinado */}
          <div className="absolute top-[-20%] bottom-[-20%] right-[-25%] lg:right-[-15%] w-[55%] lg:w-[45%] bg-[#0B132B] -skew-x-[25deg] shadow-2xl"></div>
        </div>

        {/* Logo "WISE" estilizado sobre o bloco azul (com z-20 para ficar na frente da imagem)
        <div className="absolute top-8 right-8 lg:top-12 lg:right-16 z-20 pointer-events-none hidden md:block">
          <div className="text-white text-3xl lg:text-5xl font-light tracking-[0.2em] font-headline flex gap-2">
            <span>W</span>
            <span>I</span>
            <span>S</span>
            <span>E</span>
          </div>
        </div> */}

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">

          {/* Coluna Esquerda: Texto */}
          <div className="flex flex-col gap-6 py-16 lg:py-0">
            <h1 className="text-4xl md:text-5xl lg:text-[2.6rem] xl:text-[3rem] font-bold text-slate-800 leading-[1.15] font-headline tracking-tight w-full">
              <span className="whitespace-nowrap">A justiça pode ser cega.</span><br />
              <span className="whitespace-nowrap">A gestão do seu escritório não.</span>
            </h1>


            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#0B132B] text-white font-semibold rounded-xl hover:bg-[#1a2442] transition-colors shadow-lg shadow-[#0B132B]/20"
              >
                Acessar conta
              </Link>
              <Link
                href="#plataforma"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-[#0B132B] text-[#0B132B] font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Conhecer Plataforma
              </Link>
            </div>
          </div>

          {/* Coluna Direita: Estátua */}
          <div className="relative h-[60vh] min-h-[500px] lg:h-[90vh] w-full flex items-end justify-center lg:justify-end">
            {/* A imagem deve ser renderizada com object-contain para não ser cortada */}
            <Image
              src="/temis.webp"
              alt="Deusa Têmis (Balança da Justiça)"
              fill
              className="object-contain object-bottom drop-shadow-2xl scale-125 lg:scale-[1.4] lg:translate-x-16 lg:translate-y-8 origin-bottom"
              priority
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: A DOR */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

          <div className="flex flex-col gap-6">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-headline tracking-tight leading-[1.2]">
              Advogar exige foco. Perder tempo com gestão não é uma opção.
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-light">
              O crescimento do seu escritório não precisa ser caótico. Conheça a tecnologia que centraliza sua rotina e trabalha como o seu melhor sócio.
            </p>
          </div>

          <div className="flex flex-col gap-4 bg-[#0B132B] border border-[#0B132B] p-6 md:p-8 rounded-3xl shadow-2xl shadow-[#0B132B]/20">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
              <XCircle className="text-red-400 h-6 w-6 shrink-0" strokeWidth={1.5} />
              <span className="text-slate-200 font-light text-sm md:text-base">Controle de prazos refém de planilhas manuais</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
              <XCircle className="text-red-400 h-6 w-6 shrink-0" strokeWidth={1.5} />
              <span className="text-slate-200 font-light text-sm md:text-base">Clientes cobrando status de processos no WhatsApp</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
              <XCircle className="text-red-400 h-6 w-6 shrink-0" strokeWidth={1.5} />
              <span className="text-slate-200 font-light text-sm md:text-base">Desorganização no faturamento e fluxo de caixa</span>
            </div>

            <div className="mt-4 flex items-center justify-center pt-6 border-t border-white/10">
              <span className="text-emerald-400 text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Evolua com o Wise
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO 3: OS 4 PILARES (BENTO GRID) */}
      <section id="plataforma" className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col gap-16">

          <div className="text-center max-w-3xl mx-auto">
            <span className="text-[#0B132B] font-semibold tracking-widest uppercase text-sm mb-4 block">A Plataforma</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-headline tracking-tight">
              Tudo que seu escritório precisa, em um ecossistema perfeito.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Card 1: Controle Absoluto de Casos (Tall) */}
            <div className="col-span-1 lg:col-span-4 lg:row-span-2 flex flex-col justify-between group border border-slate-200 p-8 rounded-[2rem] bg-white hover:border-[#0B132B]/30 hover:shadow-xl hover:shadow-[#0B132B]/5 transition-all duration-500 overflow-hidden relative">
              <div className="z-10">
                <div className="h-14 w-14 rounded-2xl bg-[#0B132B]/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0B132B] transition-all duration-300">
                  <FolderOpen className="h-7 w-7 text-[#0B132B] group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-headline">
                  Controle Absoluto de Casos
                </h3>
                <p className="text-slate-600 leading-relaxed font-light text-sm">
                  Acompanhe cada movimentação processual, histórico de clientes e prazos em um painel visual e totalmente intuitivo.
                </p>
              </div>

              {/* Mockup UI Simples (Kanban/Lista) */}
              <div className="mt-12 bg-slate-50 rounded-t-xl border border-slate-200 p-5 shadow-inner w-full relative z-10 translate-y-6 group-hover:translate-y-2 transition-transform duration-500 flex flex-col gap-3">
                <div className="flex gap-1.5 mb-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                </div>
                <div className="h-10 w-full bg-white rounded-lg border border-slate-200 flex items-center px-4 shadow-sm">
                  <div className="h-2 w-1/2 bg-slate-300 rounded-full"></div>
                </div>
                <div className="h-10 w-[85%] bg-white rounded-lg border border-slate-200 flex items-center px-4 shadow-sm">
                  <div className="h-2 w-1/3 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="h-10 w-[95%] bg-white rounded-lg border border-slate-200 flex items-center px-4 shadow-sm">
                  <div className="h-2 w-2/3 bg-amber-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Card 2: Comunicação Automatizada (Wide) */}
            <div className="col-span-1 lg:col-span-8 flex flex-col md:flex-row items-center gap-8 group border border-slate-200 p-8 rounded-[2rem] bg-white hover:border-[#0B132B]/30 hover:shadow-xl hover:shadow-[#0B132B]/5 transition-all duration-500 overflow-hidden relative">
              <div className="flex-1 z-10">
                <div className="h-14 w-14 rounded-2xl bg-[#0B132B]/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0B132B] transition-all duration-300">
                  <MessageCircle className="h-7 w-7 text-[#0B132B] group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-headline">
                  Comunicação Automatizada
                </h3>
                <p className="text-slate-600 leading-relaxed font-light text-sm max-w-md">
                  Reduza as ligações. O Wise envia notificações e alertas automáticos via WhatsApp e E-mail para manter seus clientes atualizados sobre qualquer avanço nos processos.
                </p>
              </div>

              {/* Mockup UI de Balão de Chat */}
              <div className="w-full md:w-72 bg-slate-50 border border-slate-200 p-5 rounded-2xl relative translate-x-4 group-hover:translate-x-0 transition-transform duration-500 shadow-inner flex flex-col gap-4">
                <div className="bg-white border border-slate-200 text-slate-700 text-xs p-4 rounded-2xl rounded-tl-sm self-start max-w-[85%] shadow-sm">
                  Doutor, alguma novidade no processo?
                </div>
                <div className="bg-[#0B132B] text-white text-xs p-4 rounded-2xl rounded-tr-sm self-end max-w-[90%] shadow-md">
                  Olá! O seu processo (Nº 1002...) teve uma movimentação favorável hoje. Já enviamos o resumo no seu e-mail.
                </div>
                <div className="bg-emerald-500/10 text-emerald-600 font-semibold text-[10px] p-2 px-3 rounded-full self-end flex items-center gap-1.5 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /> Enviado automaticamente
                </div>
              </div>
            </div>

            {/* Card 3: Produtividade (Square) */}
            <div className="col-span-1 lg:col-span-4 group border border-slate-200 p-8 rounded-[2rem] bg-white hover:border-[#0B132B]/30 hover:shadow-xl hover:shadow-[#0B132B]/5 transition-all duration-500 overflow-hidden relative flex flex-col justify-between">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-[#0B132B]/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0B132B] transition-all duration-300">
                  <CalendarCheck className="h-7 w-7 text-[#0B132B] group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-headline">
                  Produtividade Sem Falhas
                </h3>
                <p className="text-slate-600 leading-relaxed font-light text-sm">
                  Agenda e gestor de tarefas interligados. Delegue atividades para a equipe com um clique.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 transition-colors group-hover:border-emerald-500/30">
                  <div className="h-6 w-6 shrink-0 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">Petição Inicial</span>
                    <span className="text-xs text-slate-500">Concluído hoje às 14:00</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="h-6 w-6 shrink-0 rounded-full border-2 border-slate-300"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">Revisão de Contrato</span>
                    <span className="text-xs text-amber-500 font-medium">Vence amanhã</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Financeiro (Dark Square) */}
            <div className="col-span-1 lg:col-span-4 group border border-[#0B132B] p-8 rounded-[2rem] bg-[#0B132B] text-white hover:shadow-2xl hover:shadow-[#0B132B]/40 transition-all duration-500 overflow-hidden relative flex flex-col justify-between">

              <div className="absolute right-[-20%] top-[-20%] w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors duration-700"></div>

              <div className="relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="h-7 w-7 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-headline">
                  Previsibilidade Financeira
                </h3>
                <p className="text-slate-400 leading-relaxed font-light text-sm">
                  Controle de honorários, parcelamentos e despesas atreladas a casos em um fluxo simplificado.
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-4xl font-bold text-white tracking-tight">R$ 45k</span>
                  <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md flex items-center text-xs font-semibold mb-1"><TrendingUp className="h-3 w-3 mr-1" /> +12%</span>
                </div>

                {/* Mini Gráfico de Barras */}
                <div className="flex gap-3 items-end h-16 w-full opacity-90">
                  <div className="flex-1 bg-white/10 rounded-t-md h-[40%] group-hover:h-[45%] transition-all duration-500"></div>
                  <div className="flex-1 bg-white/10 rounded-t-md h-[55%] group-hover:h-[65%] transition-all duration-500 delay-75"></div>
                  <div className="flex-1 bg-white/10 rounded-t-md h-[45%] group-hover:h-[50%] transition-all duration-500 delay-100"></div>
                  <div className="flex-1 bg-emerald-500 rounded-t-md h-[80%] group-hover:h-[100%] transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] delay-150"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO 4: CALL TO ACTION FINAL */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Background sutil */}
        <div className="absolute inset-0 bg-slate-50/50"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col items-center gap-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-headline">
            Pronto para começar?
          </h2>
          <p className="text-xl text-slate-600 font-light max-w-2xl">
            Junte-se aos escritórios que já usam o Wise para focar no que realmente importa: vencer causas.
          </p>
          <Link
            href="/login"
            className="mt-4 group inline-flex items-center justify-center px-10 py-5 bg-emerald-500 text-white text-lg font-bold rounded-2xl hover:bg-emerald-600 hover:scale-105 transition-all cursor-pointer"
          >
            Garantir meu acesso
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>


      {/* FOOTER SIMPLIFICADO */}
      <footer className="bg-[#0B132B] py-6 text-slate-400 text-center text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} Wise App. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
