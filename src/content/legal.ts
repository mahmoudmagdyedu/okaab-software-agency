export const LEGAL_VERSION = "2026-08-28";

export const LEGAL_IDENTITY = {
  brandAr: "عُقاب",
  brandEn: "OKAAB",
  operatorAr: "محمود مجدي",
  operatorEn: "Mahmoud Magdy",
  countryAr: "جمهورية مصر العربية",
  countryEn: "Arab Republic of Egypt",
  email: "support@okaab.org",
  phone: "+201228086441",
} as const;

export type LegalLanguage = "ar" | "en";

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocumentCopy {
  eyebrow: string;
  title: string;
  intro: string;
  updatedLabel: string;
  versionLabel: string;
  notice: string;
  sections: LegalSection[];
  contactLabel: string;
}

export const TERMS_COPY: Record<LegalLanguage, LegalDocumentCopy> = {
  ar: {
    eyebrow: "عُقاب × مَوعِد × الكورسات",
    title: "الشروط والأحكام",
    intro:
      "تنظّم هذه الشروط استخدام موقع عُقاب وخدمات تطوير البرمجيات والمحتوى التعليمي ومنصة مَوعِد. باستخدام الخدمة أو إنشاء حساب، فإنك تقر بأنك قرأت هذه الشروط ووافقت عليها.",
    updatedLabel: "تاريخ السريان: 28 أغسطس 2026",
    versionLabel: `الإصدار ${LEGAL_VERSION}`,
    notice:
      "هذه صياغة تشغيلية عامة وليست بديلًا عن الاستشارة القانونية. لا تنتقص أي مادة من الحقوق الإلزامية التي يمنحها القانون للمستهلك.",
    contactLabel: "تواصل بشأن الشروط",
    sections: [
      {
        title: "1. من يقدّم الخدمة",
        paragraphs: [
          "عُقاب (OKAAB) علامة تشغيلية يديرها محمود مجدي بصفته مشغّلًا فرديًا من جمهورية مصر العربية. وتشمل الإشارات إلى «عُقاب» أو «نحن» المشغّل والخدمات التابعة له، ومنها منصة مَوعِد والمحتوى التعليمي المنشور على الموقع.",
          "قنوات التواصل الرسمية هي support@okaab.org ورقم +201228086441. تُستكمل بيانات السجل التجاري والتسجيل الضريبي والعنوان الرسمي في هذه الصفحة فور اعتمادها.",
        ],
      },
      {
        title: "2. الأهلية والسلطة",
        bullets: [
          "يجب أن يكون منشئ حساب مَوعِد بالغًا 18 عامًا على الأقل وقادرًا قانونًا على التعاقد، أو مفوضًا عن المنشأة التي يسجلها.",
          "يجوز للقاصر تصفح المحتوى التعليمي العام تحت إشراف ولي أمره، ولا يجوز له إبرام معاملة مدفوعة أو إنشاء حساب تجاري منفردًا.",
          "أنت مسؤول عن دقة بيانات التسجيل والمحافظة على سرية حسابك وإبلاغنا فورًا عن أي استخدام غير مصرح به.",
        ],
      },
      {
        title: "3. خدمات الوكالة وعروض الأسعار",
        paragraphs: [
          "إرسال نموذج طلب عرض السعر لا ينشئ عقدًا ولا التزامًا بالدفع. يبدأ المشروع فقط بعد قبول عرض أو نطاق عمل مكتوب يحدد المخرجات والمراحل والسعر والضرائب والمدة وشروط الدفع والإلغاء والصيانة.",
          "إذا تعارض تفصيل تجاري في عرض أو أمر عمل مقبول مع هذه الشروط، يسري المستند الخاص بالمشروع على ذلك التفصيل، مع بقاء الحقوق الإلزامية للمستهلك محفوظة.",
        ],
      },
      {
        title: "4. الكورسات والمحتوى التعليمي",
        bullets: [
          "الكورسات المتاحة حاليًا محتوى تعليمي مجاني، للاستخدام الشخصي غير التجاري ما لم يذكر خلاف ذلك بوضوح.",
          "لا نضمن أن يؤدي المحتوى إلى وظيفة أو شهادة أو نتيجة مهنية محددة، ولا يُعد نصيحة قانونية أو مالية أو مهنية متخصصة.",
          "لا يجوز نسخ الكورسات أو ملفات Slides أو إعادة بيعها أو نشرها أو إزالة إشعارات الملكية إلا بإذن مكتوب أو في الحدود التي يسمح بها القانون.",
        ],
      },
      {
        title: "5. منصة مَوعِد",
        paragraphs: [
          "توفّر مَوعِد أدوات للمنشآت لإدارة الفروع والخدمات والموظفين والعملاء والمواعيد. المنشأة المعروضة في صفحة الحجز هي مقدّم الخدمة الفعلي للعميل، وهي المسؤولة عن وصف الخدمة وسعرها وتوافرها والعربون والإلغاء والتنفيذ والفواتير والالتزامات المهنية الخاصة بنشاطها.",
          "عُقاب ليست طرفًا في العلاقة المهنية أو العلاجية أو التجارية بين المنشأة وعميلها، ولا تستلم حاليًا مدفوعات الحجز داخل المنصة. يجب حل نزاع الخدمة أو العربون أولًا مع المنشأة، مع بقاء حق العميل في الرجوع إلى الجهات المختصة.",
        ],
      },
      {
        title: "6. الأسعار والدفع والإلغاء والاسترداد",
        bullets: [
          "لا يوجد حاليًا Checkout مباشر على موقع عُقاب، والكورسات العامة مجانية.",
          "دفعات مشروعات البرمجيات وإلغاؤها واستردادها تتبع عرض السعر أو أمر العمل المقبول، ولا يجوز أن ينتقص ذلك من حق إلزامي للمستهلك.",
          "مدفوعات الحجوزات والعربون في مَوعِد تتم بين المنشأة وعميلها وتخضع للسياسة التي تعرضها المنشأة قبل تأكيد الحجز.",
          "إذا أضفنا دفعًا أو اشتراكًا مباشرًا مستقبلًا، سنعرض السعر الكامل والضرائب والتجديد والإلغاء والاسترداد قبل الشراء ونطلب موافقة صريحة منفصلة عند اللزوم.",
        ],
      },
      {
        title: "7. الاستخدام المقبول",
        bullets: [
          "يحظر اختراق الخدمة أو تجاوز صلاحيات الوصول أو تعطيلها أو تحميل برمجيات خبيثة أو كشط البيانات آليًا دون إذن.",
          "يحظر استخدام الخدمة لانتهاك القانون أو حقوق الملكية أو الخصوصية، أو لإرسال رسائل غير مرغوب فيها أو محتوى احتيالي أو ضار.",
          "يجوز لنا تقييد أو تعليق الاستخدام عند وجود خطر أمني أو مخالفة جوهرية، مع إخطار معقول وفرصة للتصحيح متى كان ذلك آمنًا وممكنًا قانونًا.",
        ],
      },
      {
        title: "8. محتوى العميل والبيانات",
        paragraphs: [
          "تحتفظ أنت بملكية المواد والبيانات التي تقدمها. تمنحنا ترخيصًا محدودًا وغير حصري بالاستضافة والمعالجة والنسخ بالقدر اللازم لتقديم الخدمة والدعم والأمان وتنفيذ العقد.",
          "تضمن أن لديك الحق في تزويدنا بهذه المواد والبيانات. وعلى منشآت مَوعِد توفير إشعار الخصوصية والأساس القانوني المناسب لبيانات عملائها وموظفيها، وتحديد من يملك حق الوصول إليها.",
        ],
      },
      {
        title: "9. ملكية عُقاب",
        paragraphs: [
          "تظل العلامة والتصميمات والبرمجيات والمحتوى والنماذج والمواد السابقة للمشروع ملكًا لعُقاب أو لأصحاب تراخيصها. وتنتقل أو تُرخّص مخرجات المشروع للعميل فقط وفق ما ينص عليه عرض العمل المقبول وبعد استيفاء الدفعات المستحقة.",
        ],
      },
      {
        title: "10. الخدمات الخارجية",
        paragraphs: [
          "قد تعتمد الخدمة على مزودين مثل Clerk وSupabase وHeroku وResend وGoogle وYouTube وWhatsApp. تخضع هذه الخدمات أيضًا لشروط مزوديها، ولسنا مسؤولين عن انقطاع خارج نطاق سيطرتنا، لكننا نتخذ خطوات معقولة لاستعادة الخدمة وتقليل الأثر.",
        ],
      },
      {
        title: "11. التوافر والضمانات",
        paragraphs: [
          "نقدّم الخدمات بعناية مهنية معقولة ونعالج الأعطال المبلغ عنها. قد يلزم توقف مخطط للصيانة أو تحديثات أمنية. لا نَعِد بخدمة خالية تمامًا من الأخطاء أو متاحة دون انقطاع، ولا تستبعد هذه الصياغة أي ضمان قانوني إلزامي.",
        ],
      },
      {
        title: "12. حدود المسؤولية",
        paragraphs: [
          "إلى الحد الذي يسمح به القانون، لا نتحمل الخسائر غير المباشرة أو التي لم يكن من المعقول توقعها عند التعاقد. لا ينطبق أي حد على الغش أو الخطأ الجسيم أو الضرر البدني أو حقوق المستهلك أو أي مسؤولية لا يجيز القانون استبعادها.",
          "تُحدد المسؤولية التجارية عن مشروع مدفوع في مستند المشروع المقبول حيثما يسمح القانون، ولا يؤثر ذلك في الحقوق الإلزامية للطرف الآخر.",
        ],
      },
      {
        title: "13. إنهاء الخدمة والبيانات",
        paragraphs: [
          "يمكنك التوقف عن استخدام الخدمات أو طلب إغلاق حسابك. قبل إغلاق حساب مَوعِد، يمكن للمنشأة طلب نسخة قابلة للاستخدام من بياناتها حيثما كان ذلك متاحًا ومعقولًا. قد نحتفظ بسجلات محدودة للوفاء بالتزامات قانونية أو إثبات المعاملات وحماية الحقوق.",
        ],
      },
      {
        title: "14. تعديل الشروط",
        paragraphs: [
          "قد نحدّث هذه الشروط لأسباب قانونية أو أمنية أو تشغيلية. سنغيّر رقم الإصدار وتاريخ السريان، ونطلب قبولًا جديدًا من أصحاب الحسابات عند إجراء تغيير جوهري. لا تسري التغييرات بأثر رجعي على حقوق اكتسبت قبلها.",
        ],
      },
      {
        title: "15. القانون والنزاعات",
        paragraphs: [
          "تخضع هذه الشروط للقانون المصري. يتواصل الطرفان أولًا عبر support@okaab.org لمحاولة تسوية النزاع وديًا خلال 30 يومًا، ثم يُعرض النزاع على المحاكم المصرية المختصة.",
          "إذا كنت مستهلكًا، فلا يحرمك هذا الاختيار من حماية أو جهة أو محكمة إلزامية متاحة لك بموجب قانون بلد إقامتك. ويمكن للمستهلك في مصر التواصل مع جهاز حماية المستهلك وفق قنواته الرسمية.",
        ],
      },
      {
        title: "16. اللغة والتواصل",
        paragraphs: [
          "تتوفر الشروط بالعربية والإنجليزية بقصد تقديم المعنى نفسه. تكون العربية مرجع التفسير في مصر إلى الحد الذي يسمح به القانون، دون المساس بحماية إلزامية مقررة للمستخدم. للاستفسارات والشكاوى القانونية راسل support@okaab.org.",
        ],
      },
    ],
  },
  en: {
    eyebrow: "OKAAB × Mawid × Courses",
    title: "Terms and Conditions",
    intro:
      "These terms govern the OKAAB website, software-development services, educational content, and the Mawid booking platform. By using a service or creating an account, you acknowledge that you have read and accepted them.",
    updatedLabel: "Effective: 28 August 2026",
    versionLabel: `Version ${LEGAL_VERSION}`,
    notice:
      "This is a general operational document, not a substitute for legal advice. Nothing in it limits mandatory consumer rights.",
    contactLabel: "Contact us about these terms",
    sections: [
      {
        title: "1. Service provider",
        paragraphs: [
          "OKAAB is an operating brand run by Mahmoud Magdy as a sole operator in the Arab Republic of Egypt. References to “OKAAB”, “we”, or “us” include the operator and its services, including Mawid and educational content published on this website.",
          "Official contact channels are support@okaab.org and +201228086441. Commercial-registration, tax-registration, and official-address details will be added here once verified.",
        ],
      },
      {
        title: "2. Eligibility and authority",
        bullets: [
          "A Mawid account creator must be at least 18 and legally able to contract, or authorised to act for the registered business.",
          "A minor may view public educational content with guardian supervision, but may not independently create a business account or enter a paid transaction.",
          "You are responsible for accurate registration details, account security, and promptly reporting unauthorised use.",
        ],
      },
      {
        title: "3. Agency services and quotations",
        paragraphs: [
          "Submitting a quote request does not create a contract or payment obligation. A project begins only after acceptance of a written proposal or statement of work describing deliverables, milestones, price, taxes, timing, payment, cancellation, and maintenance.",
          "A specific commercial term in an accepted project document prevails over these general terms for that project, without limiting mandatory consumer rights.",
        ],
      },
      {
        title: "4. Courses and educational content",
        bullets: [
          "Courses currently available are free educational content for personal, non-commercial use unless clearly stated otherwise.",
          "We do not guarantee employment, certification, or a particular professional outcome, and the content is not specialist legal, financial, or professional advice.",
          "You may not republish, sell, copy, or remove rights notices from courses or Slides except with written permission or as permitted by law.",
        ],
      },
      {
        title: "5. Mawid platform",
        paragraphs: [
          "Mawid gives businesses tools to manage branches, services, staff, customers, and appointments. The business shown on a booking page is the actual service provider and is responsible for descriptions, pricing, availability, deposits, cancellation, delivery, invoices, and professional obligations.",
          "OKAAB is not a party to the professional, clinical, or commercial relationship between that business and its customer and does not currently collect booking payments in the platform. Service or deposit disputes should first be raised with the business, without limiting the customer's right to contact a competent authority.",
        ],
      },
      {
        title: "6. Prices, payment, cancellation, and refunds",
        bullets: [
          "There is currently no direct OKAAB checkout, and public courses are free.",
          "Agency-project payments, cancellation, and refunds follow the accepted proposal or statement of work and may not waive mandatory consumer rights.",
          "Mawid booking payments and deposits are between the listed business and its customer under the policy shown before booking confirmation.",
          "If direct payment or subscriptions are added, we will disclose total price, taxes, renewal, cancellation, and refund information before purchase and obtain separate express consent where required.",
        ],
      },
      {
        title: "7. Acceptable use",
        bullets: [
          "Do not breach security, bypass access controls, disrupt the service, upload malware, or scrape data without permission.",
          "Do not use the services unlawfully, infringe intellectual-property or privacy rights, or send fraudulent, harmful, or unsolicited content.",
          "We may restrict or suspend use for a material breach or security risk, with reasonable notice and an opportunity to remedy where safe and legally possible.",
        ],
      },
      {
        title: "8. Customer content and data",
        paragraphs: [
          "You retain ownership of materials and data you provide and grant us a limited, non-exclusive licence to host, process, and copy them only as needed to provide, support, and secure the service or perform the contract.",
          "You confirm that you may lawfully provide those materials and data. Mawid businesses must give their own customers and staff appropriate privacy information, establish a lawful basis, and control access.",
        ],
      },
      {
        title: "9. OKAAB intellectual property",
        paragraphs: [
          "The brand, designs, software, content, templates, and pre-existing materials remain owned by OKAAB or its licensors. Project deliverables transfer or are licensed only as described in the accepted project document and after applicable payments are made.",
        ],
      },
      {
        title: "10. Third-party services",
        paragraphs: [
          "The services may rely on providers including Clerk, Supabase, Heroku, Resend, Google, YouTube, and WhatsApp. Their own terms may also apply. We are not responsible for outages beyond our control, but will take reasonable steps to restore service and reduce impact.",
        ],
      },
      {
        title: "11. Availability and warranties",
        paragraphs: [
          "We provide the services with reasonable professional care and address reported faults. Planned maintenance and security updates may require downtime. We do not promise uninterrupted or error-free operation, and this wording does not exclude any mandatory statutory warranty.",
        ],
      },
      {
        title: "12. Liability",
        paragraphs: [
          "To the extent permitted by law, we are not liable for indirect losses or losses that were not reasonably foreseeable when the contract was made. No limit applies to fraud, gross fault, personal injury, mandatory consumer rights, or liability that law does not permit us to exclude.",
          "Liability for a paid business project may be specified in its accepted project document where lawful, without affecting either party's mandatory rights.",
        ],
      },
      {
        title: "13. Ending service and data",
        paragraphs: [
          "You may stop using the services or request account closure. Before closing a Mawid account, a business may request a usable copy of its data where reasonably available. We may retain limited records to meet legal obligations, evidence transactions, or protect rights.",
        ],
      },
      {
        title: "14. Changes to these terms",
        paragraphs: [
          "We may update these terms for legal, security, or operational reasons. We will change the version and effective date and require account holders to accept a material change again. Changes do not retrospectively remove accrued rights.",
        ],
      },
      {
        title: "15. Governing law and disputes",
        paragraphs: [
          "Egyptian law governs these terms. The parties will first contact support@okaab.org and attempt an amicable resolution for 30 days, after which a dispute may be brought before the competent Egyptian courts.",
          "If you are a consumer, this choice does not remove mandatory protection, authority access, or forum rights under the law of your country of residence.",
        ],
      },
      {
        title: "16. Language and contact",
        paragraphs: [
          "Arabic and English versions are intended to convey the same meaning. Arabic is the reference for interpretation in Egypt to the extent permitted by law, without limiting mandatory user protection. Contact support@okaab.org for legal questions or complaints.",
        ],
      },
    ],
  },
};

export const PRIVACY_COPY: Record<LegalLanguage, LegalDocumentCopy> = {
  ar: {
    eyebrow: "عُقاب × مَوعِد",
    title: "سياسة الخصوصية",
    intro:
      "توضح هذه السياسة كيف نجمع البيانات الشخصية ونستخدمها ونشاركها ونحفظها عند استخدام موقع عُقاب والكورسات ومنصة مَوعِد أو التواصل معنا.",
    updatedLabel: "تاريخ السريان: 28 أغسطس 2026",
    versionLabel: `الإصدار ${LEGAL_VERSION}`,
    notice:
      "تنطبق حقوق كل مستخدم وفق القانون الذي يسري عليه. نعرض حقوق مصر، ونضيف حقوق الاتحاد الأوروبي والمملكة المتحدة عندما ينطبق نطاق قوانينهما.",
    contactLabel: "قدّم طلب خصوصية",
    sections: [
      {
        title: "1. المتحكم والمسؤوليات",
        paragraphs: [
          "محمود مجدي، المشغّل الفردي لعلامة عُقاب في جمهورية مصر العربية، هو المتحكم في بيانات موقع عُقاب والحسابات المباشرة وطلبات عروض الأسعار والدعم.",
          "في مَوعِد، تكون المنشأة المشتركة متحكمًا مستقلًا في بيانات عملائها وموظفيها ومواعيدها، وتعالج عُقاب تلك البيانات لتقديم المنصة نيابة عنها. قد نكون متحكمًا مستقلًا في بيانات حساب مسؤولي المنشأة والأمان والفوترة والدعم.",
        ],
      },
      {
        title: "2. البيانات التي نجمعها",
        bullets: [
          "بيانات الهوية والتواصل والحساب: الاسم والبريد والهاتف وصورة الحساب والمنشأة والدور الوظيفي.",
          "بيانات طلب العرض والمشروع والدعم والمراسلات والملفات التي ترسلها لنا.",
          "بيانات مَوعِد: بيانات الفروع والموظفين والعملاء والخدمات والأسعار والمواعيد والعربون وسجل النشاط.",
          "بيانات الاستخدام والأمان: وقت الطلب والجهاز والمتصفح وعنوان الشبكة وسجلات الدخول والأخطاء والإجراءات الأمنية.",
          "بيانات الدخول من Google أو Clerk أو Supabase وفق البيانات التي يصرح المستخدم أو المزود بمشاركتها؛ ولا نستلم كلمة مرور Google.",
        ],
      },
      {
        title: "3. المصادر والأغراض",
        bullets: [
          "نحصل على البيانات منك، أو من المنشأة التي تستخدم مَوعِد، أو من مزود تسجيل الدخول، أو تلقائيًا أثناء تشغيل الخدمة.",
          "نستخدمها لاتخاذ خطوات قبل التعاقد وتنفيذ العقود، وإنشاء الحسابات، وتشغيل الحجز والكورسات، وتقديم الدعم، وإرسال رسائل الخدمة.",
          "نستخدم الحد اللازم للأمان ومنع الاحتيال وتشخيص الأعطال وتحسين الموثوقية استنادًا إلى مصالح مشروعة لا تتغلب على حقوقك.",
          "نعالج ما يلزم للوفاء بالتزام قانوني أو حماية الحقوق، ونطلب الموافقة للرسائل التسويقية أو الاستخدامات الاختيارية حيث يوجبها القانون.",
        ],
      },
      {
        title: "4. المشاركة والمعالجون",
        paragraphs: [
          "لا نبيع البيانات الشخصية. نشارك الحد اللازم مع مزودي الخدمة: Clerk وSupabase للمصادقة والبيانات، Heroku للاستضافة، Resend للبريد، Google لتسجيل الدخول وYouTube للمحتوى، وWhatsApp إذا اخترت التواصل من خلاله.",
          "قد نشارك بيانات مع مستشارين أو جهات رسمية عند وجود التزام قانوني صالح، أو عند الضرورة لحماية المستخدمين والخدمة والحقوق. ويلتزم كل طرف بدوره القانوني وضوابط الوصول المناسبة.",
        ],
      },
      {
        title: "5. النقل الدولي",
        paragraphs: [
          "قد يعالج مزودونا البيانات خارج مصر أو بلد إقامتك. نقيّم المزودين ونستخدم اتفاقات وضوابط تعاقدية وتقنية مناسبة حيث يلزم، مثل الشروط التعاقدية المعتمدة عند انطباقها. لا يعني استخدام مزود دولي أن جميع الدول تمنح المستوى نفسه من الحماية.",
        ],
      },
      {
        title: "6. مدة الحفظ",
        bullets: [
          "بيانات الحساب ومَوعِد تُحفظ أثناء نشاط الحساب ثم للمدة اللازمة للتصدير أو الإغلاق وتسوية النزاعات والالتزامات القانونية.",
          "طلبات عروض الأسعار والمراسلات تُحفظ بقدر ما يلزم للمتابعة وإثبات التعامل أو الدفاع عن الحقوق.",
          "سجلات الأمان والنسخ الاحتياطية تُحفظ لفترات محدودة تحددها الحاجة الأمنية ودورات النسخ الاحتياطي.",
          "بعد انتهاء الحاجة نحذف البيانات أو نجعلها مجهولة أو غير قابلة للربط بك، ما لم يوجب القانون حفظها.",
        ],
      },
      {
        title: "7. حقوقك",
        paragraphs: [
          "وفق القانون المنطبق، يمكنك طلب العلم بالمعالجة والوصول إلى بياناتك ونسخة منها وتصحيحها أو محوها أو تقييدها، والاعتراض على بعض المعالجة، وسحب الموافقة دون أثر رجعي، ونقل البيانات حيث ينطبق الحق.",
          "قد نطلب إثبات الهوية ونرد خلال المدة القانونية. بعض الطلبات قد تكون محدودة لحماية حقوق الآخرين أو الوفاء بالتزام قانوني. ويمكنك الشكوى لدى الجهة المختصة بحماية البيانات في بلدك، مع حقك في اللجوء للقضاء.",
        ],
      },
      {
        title: "8. الأمان والحوادث",
        paragraphs: [
          "نستخدم تشفير النقل وضوابط الوصول وعزل بيانات المنشآت والسجلات والنسخ الاحتياطي والمراقبة. لا توجد وسيلة إلكترونية آمنة بنسبة 100%. عند وقوع حادث يستوجب الإخطار، نتخذ إجراءات الاحتواء ونخطر الجهة أو الأشخاص المتأثرين وفق القانون.",
        ],
      },
      {
        title: "9. الأطفال والقرارات الآلية",
        paragraphs: [
          "حسابات مَوعِد التجارية مخصصة للبالغين. إذا أدخلت منشأة بيانات قاصر ضمن حجز، فهي مسؤولة عن وجود أساس قانوني وإشراف ولي الأمر عند اللزوم. لا نستخدم البيانات لاتخاذ قرارات آلية تنتج أثرًا قانونيًا على المستخدم، ولا نبيعها للإعلانات السلوكية.",
        ],
      },
      {
        title: "10. التخزين المحلي والروابط الخارجية",
        paragraphs: [
          "نستخدم ملفات تعريف ارتباط أو تخزينًا محليًا ضروريًا لتسجيل الدخول والأمان واللغة والمظهر. لا نستخدم حاليًا ملفات إعلانية سلوكية. إذا أضفنا أدوات غير ضرورية، سنعرض اختيار الموافقة حيث يطلب القانون.",
          "قد تنقلك روابط Google وYouTube وWhatsApp إلى خدمات لها سياسات مستقلة، ويجب مراجعتها قبل استخدامها.",
        ],
      },
      {
        title: "11. التغييرات والتواصل",
        paragraphs: [
          "سنحدّث التاريخ والإصدار عند تغيير هذه السياسة، ونقدم إشعارًا أو نطلب قبولًا جديدًا إذا كان التغيير جوهريًا. أرسل طلبات الخصوصية إلى support@okaab.org مع وصف الطلب والخدمة المعنية.",
        ],
      },
    ],
  },
  en: {
    eyebrow: "OKAAB × Mawid",
    title: "Privacy Policy",
    intro:
      "This policy explains how we collect, use, share, and retain personal data when you use the OKAAB website, courses, or Mawid, or contact us.",
    updatedLabel: "Effective: 28 August 2026",
    versionLabel: `Version ${LEGAL_VERSION}`,
    notice:
      "Each person has the rights given by the law applicable to them. We describe Egyptian rights and add EU and UK rights where those laws apply.",
    contactLabel: "Submit a privacy request",
    sections: [
      {
        title: "1. Controller and roles",
        paragraphs: [
          "Mahmoud Magdy, the sole operator of the OKAAB brand in the Arab Republic of Egypt, controls data relating to the OKAAB website, direct accounts, quote requests, and support.",
          "For Mawid, the subscribing business is an independent controller of its customer, staff, and appointment data, while OKAAB processes that data to provide the platform. We may independently control business-account, security, billing, and support data.",
        ],
      },
      {
        title: "2. Data we collect",
        bullets: [
          "Identity, contact, and account data: name, email, phone, profile image, business, and role.",
          "Quote, project, support, correspondence, and file data you send us.",
          "Mawid data: branches, staff, customers, services, prices, appointments, deposits, and activity records.",
          "Usage and security data: request time, device, browser, network address, sign-in, error, and security logs.",
          "Sign-in data supplied through Google, Clerk, or Supabase according to the user's or provider's settings; we do not receive a Google password.",
        ],
      },
      {
        title: "3. Sources, purposes, and legal bases",
        bullets: [
          "We receive data from you, a business using Mawid, a sign-in provider, or automatically while operating the service.",
          "We use it to take pre-contract steps, perform contracts, create accounts, operate booking and courses, provide support, and send service messages.",
          "We use the minimum needed for security, fraud prevention, fault diagnosis, and reliability under legitimate interests that do not override your rights.",
          "We process data to meet legal obligations or protect rights and request consent for marketing or optional uses where law requires it.",
        ],
      },
      {
        title: "4. Sharing and processors",
        paragraphs: [
          "We do not sell personal data. We share only what is needed with providers including Clerk and Supabase for authentication and data, Heroku for hosting, Resend for email, Google for sign-in, YouTube for content, and WhatsApp when you choose that channel.",
          "We may disclose data to advisers or authorities under a valid legal obligation or where necessary to protect users, the service, or legal rights. Each party must follow its legal role and suitable access controls.",
        ],
      },
      {
        title: "5. International transfers",
        paragraphs: [
          "Providers may process data outside Egypt or your country. We assess providers and use appropriate contractual and technical controls where required, including approved contractual clauses where applicable. An international provider does not mean every destination offers identical legal protection.",
        ],
      },
      {
        title: "6. Retention",
        bullets: [
          "Account and Mawid data is kept while an account is active and then as needed for export, closure, disputes, and legal duties.",
          "Quote requests and correspondence are kept as needed for follow-up, transaction evidence, or legal claims.",
          "Security logs and backups are kept for limited periods based on security needs and backup cycles.",
          "When no longer needed, data is deleted, anonymised, or de-linked unless law requires retention.",
        ],
      },
      {
        title: "7. Your rights",
        paragraphs: [
          "Depending on applicable law, you may request information, access and a copy, correction, deletion, restriction, objection to certain processing, withdrawal of consent without retrospective effect, and portability where available.",
          "We may verify identity and respond within the legal period. A request may be limited to protect others or meet a legal duty. You may complain to the competent data-protection authority in your country and retain your right to a judicial remedy.",
        ],
      },
      {
        title: "8. Security and incidents",
        paragraphs: [
          "We use transport encryption, access controls, tenant isolation, logging, backups, and monitoring. No electronic method is 100% secure. If an incident requires notice, we will contain it and notify the authority or affected people as required by law.",
        ],
      },
      {
        title: "9. Children and automated decisions",
        paragraphs: [
          "Mawid business accounts are for adults. If a business records a minor's booking data, that business must establish a lawful basis and guardian involvement where required. We do not use personal data for solely automated decisions producing legal effects, and do not sell it for behavioural advertising.",
        ],
      },
      {
        title: "10. Local storage and external links",
        paragraphs: [
          "We use cookies or local storage needed for sign-in, security, language, and appearance. We currently do not use behavioural-advertising cookies. If non-essential tools are added, we will offer a consent choice where required.",
          "Google, YouTube, and WhatsApp links may take you to services with independent policies that you should review.",
        ],
      },
      {
        title: "11. Changes and contact",
        paragraphs: [
          "We will update the date and version when this policy changes and provide notice or request renewed acceptance for a material change. Send privacy requests to support@okaab.org and describe the request and relevant service.",
        ],
      },
    ],
  },
};

export interface AboutCopy {
  eyebrow: string;
  title: string;
  intro: string;
  valuesTitle: string;
  values: Array<{ title: string; body: string }>;
  storyTitle: string;
  story: string[];
  servicesTitle: string;
  services: string[];
  audienceTitle: string;
  audience: string;
  ctaTitle: string;
  ctaBody: string;
  ctaLabel: string;
}

export const ABOUT_COPY: Record<LegalLanguage, AboutCopy> = {
  ar: {
    eyebrow: "فريق برمجيات من مصر",
    title: "نبني منتجات رقمية واضحة، سريعة، وقابلة للنمو.",
    intro:
      "عُقاب وكالة برمجيات يديرها محمود مجدي، تعمل مع أصحاب المشاريع والشركات في مصر والخليج وأوروبا لتحويل الفكرة إلى موقع أو تطبيق أو منصة تعمل في الواقع، لا في العرض التقديمي فقط.",
    valuesTitle: "ما الذي يهمنا",
    values: [
      {
        title: "وضوح من البداية",
        body: "نحوّل الهدف إلى نطاق ومراحل ومخرجات مكتوبة يمكن متابعتها.",
      },
      {
        title: "هندسة تعيش",
        body: "نبني بنية آمنة وقابلة للصيانة بدل حلول سريعة يصعب تطويرها لاحقًا.",
      },
      {
        title: "شراكة مباشرة",
        body: "تتواصل مع الفريق الذي يحلل ويصمم وينفّذ، دون طبقات تعطل القرار.",
      },
    ],
    storyTitle: "من نحن",
    story: [
      "نحن فريق صغير يجمع تطوير الواجهات والأنظمة الخلفية وتجربة المستخدم وتشغيل البنية التحتية. نفضّل الفرق الصغيرة لأنها تجعل المسؤولية واضحة والقرار أسرع.",
      "نبدأ بفهم طريقة عمل النشاط والمستخدم، ثم نصمم الرحلة وننفذها ونختبرها ونرفعها ونتابعها بعد الإطلاق. مَوعِد والكورسات والمشروعات المعروضة على الموقع أمثلة على اهتمامنا بالمنتج كاملًا، من قاعدة البيانات حتى آخر زر يراه المستخدم.",
    ],
    servicesTitle: "ما الذي نبنيه",
    services: [
      "مواقع الشركات والمتاجر الإلكترونية",
      "منصات SaaS ولوحات التحكم والبوابات",
      "تطبيقات Android وiOS",
      "تكاملات الدفع والشحن والفوترة وواجهات API",
      "رفع وإدارة الخوادم والأمان والنسخ الاحتياطي",
      "تحسين السرعة وSEO والدعم الفني",
    ],
    audienceTitle: "مع من نعمل",
    audience:
      "نعمل مع مؤسسين وفرق وشركات تحتاج شريكًا تقنيًا مسؤولًا عن الرحلة كاملة. يتم الاتفاق على النطاق والمدة والميزانية في عرض مكتوب بعد جلسة اكتشاف قصيرة.",
    ctaTitle: "لديك منتج يحتاج إلى فريق ثابت؟",
    ctaBody: "أرسل الهدف والمرحلة الحالية، وسنعود إليك بأسئلة واضحة وخطوة تالية عملية.",
    ctaLabel: "اطلب عرض سعر",
  },
  en: {
    eyebrow: "A software team based in Egypt",
    title: "We build clear, fast digital products designed to grow.",
    intro:
      "OKAAB is a software agency operated by Mahmoud Magdy. We work with founders and companies across Egypt, the Gulf, and Europe to turn an idea into a website, app, or platform that works in practice—not only in a pitch deck.",
    valuesTitle: "What matters to us",
    values: [
      {
        title: "Clarity from day one",
        body: "We turn the goal into a written scope, stages, and deliverables you can follow.",
      },
      {
        title: "Engineering that lasts",
        body: "We design secure, maintainable systems instead of short-lived fixes.",
      },
      {
        title: "Direct partnership",
        body: "You work with the people who analyse, design, and build, keeping decisions fast.",
      },
    ],
    storyTitle: "Who we are",
    story: [
      "We are a small team spanning front-end and back-end engineering, user experience, and infrastructure operations. A focused team keeps ownership clear and decisions quick.",
      "We learn how the business and its users work, design the journey, build and test it, launch it, and stay involved afterwards. Mawid, our courses, and the projects on this site reflect our interest in the whole product—from the database to the last button a customer sees.",
    ],
    servicesTitle: "What we build",
    services: [
      "Company websites and ecommerce stores",
      "SaaS platforms, dashboards, and portals",
      "Android and iOS applications",
      "Payment, shipping, invoicing, and API integrations",
      "Hosting, server operations, security, and backups",
      "Performance, SEO, and ongoing technical support",
    ],
    audienceTitle: "Who we work with",
    audience:
      "We work with founders, teams, and organisations that need one accountable technical partner across the product lifecycle. Scope, timing, and budget are confirmed in a written proposal after a short discovery session.",
    ctaTitle: "Need a steady team for your product?",
    ctaBody:
      "Send us the goal and current stage, and we will come back with focused questions and a practical next step.",
    ctaLabel: "Request a quote",
  },
};
