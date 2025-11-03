function Dashboard({ user }) {
    return (
        <div className="row g-6">
            {/* Welcome Card */}
            <div className="col-md-12 col-xxl-8">
                <div className="card">
                    <div className="d-flex align-items-end row">
                        <div className="col-md-6 order-2 order-md-1">
                            <div className="card-body">
                                <h4 className="card-title mb-4">
                                    Xush kelibsiz, <span className="fw-bold">{user?.name || 'User'}!</span> 🎉
                                </h4>
                                <p className="mb-0">Siz muvaffaqiyatli tizimga kirdingiz.</p>
                                <p>Yangi imkoniyatlarni kashf eting!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="col-xxl-2 col-sm-6">
                <div className="card h-100">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div className="avatar">
                                <div className="avatar-initial bg-label-primary rounded-3">
                                    <i className="icon-base ri ri-book-open-line icon-24px"></i>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <p className="mb-0 text-success me-1">+22%</p>
                                <i className="icon-base ri ri-arrow-up-s-line text-success"></i>
                            </div>
                        </div>
                        <div className="card-info mt-5">
                            <h5 className="mb-1">12</h5>
                            <p>Darslar</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xxl-2 col-sm-6">
                <div className="card h-100">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div className="avatar">
                                <div className="avatar-initial bg-label-success rounded-3">
                                    <i className="icon-base ri ri-file-list-3-line icon-24px"></i>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <p className="mb-0 text-success me-1">+38%</p>
                                <i className="icon-base ri ri-arrow-up-s-line text-success"></i>
                            </div>
                        </div>
                        <div className="card-info mt-5">
                            <h5 className="mb-1">8</h5>
                            <p>Topshiriqlar</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;